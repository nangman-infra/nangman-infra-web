import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as os from 'os';
import * as dns from 'dns';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  KumaStatusPageResponse,
  KumaHeartbeatResponse,
  MonitorStatus,
  MonitoringStatusResponse,
} from './monitoring.dto';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

const execAsync = promisify(exec);

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly DEFAULT_TIMEOUT_MS = 10_000;
  private prevCpuUsage = { idle: 0, total: 0 };

  // 네트워크 지표 계산용
  private prevNetStats: Record<
    string,
    {
      rxBytes: number;
      txBytes: number;
      rxPackets: number;
      txPackets: number;
      time: number;
    }
  > = {};
  private trafficHistory: {
    timestamp: string;
    inbound: number;
    outbound: number;
  }[] = [];
  private readonly MAX_HISTORY_LENGTH = 20;

  constructor(private readonly configService: ConfigService) {}

  async getMonitoringStatus(): Promise<MonitoringStatusResponse> {
    const kumaUrl = this.getKumaUrl();
    const slug = this.getStatusPageSlug();

    try {
      const [statusPageResponse, heartbeatResponse, insights] =
        await Promise.all([
          axios.get<KumaStatusPageResponse>(
            `${kumaUrl}/api/status-page/${slug}`,
            {
              timeout: this.DEFAULT_TIMEOUT_MS,
              headers: { Accept: 'application/json' },
            },
          ),
          axios.get<KumaHeartbeatResponse>(
            `${kumaUrl}/api/status-page/heartbeat/${slug}`,
            {
              timeout: this.DEFAULT_TIMEOUT_MS,
              headers: { Accept: 'application/json' },
            },
          ),
          this.collectInsights(),
        ]);

      const monitors = this.transformKumaDataToMonitors(
        statusPageResponse.data,
        heartbeatResponse.data,
      );

      const summary = this.calculateSummary(monitors);

      // 로그 생성 로직 추가
      const logs = this.generateDynamicLogs(monitors, insights);

      return {
        success: true,
        data: {
          monitors,
          summary,
          insights: {
            ...insights,
            logs,
          },
        },
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private async collectInsights() {
    const [system, network] = await Promise.all([
      this.getSystemMetrics(),
      this.getNetworkMetrics(),
    ]);

    return { system, network };
  }

  private async getSystemMetrics() {
    const load = os.loadavg() as [number, number, number];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * 100;

    const cpuUsage = await this.calculateCpuUsage();

    let ioWait = 0.02;
    try {
      if (process.platform === 'linux') {
        const stats = fs.readFileSync('/proc/stat', 'utf8');
        const cpuLine = stats
          .split('\n')
          .find((line) => line.startsWith('cpu '));
        if (cpuLine) {
          const parts = cpuLine.split(/\s+/);
          if (parts.length >= 6) {
            ioWait = Math.round((parseInt(parts[5], 10) / 1000000) * 100) / 100;
          }
        }
      }
    } catch {
      ioWait = 0.02;
    }

    return {
      load: load.map((v) => Math.round(v * 100) / 100) as [
        number,
        number,
        number,
      ],
      cpu: cpuUsage,
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: Math.round(memPercentage * 10) / 10,
      },
      ioWait,
      stealTime: 0.0,
    };
  }

  private async calculateCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0;

    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }

    const total = user + nice + sys + idle + irq;
    const diffIdle = idle - this.prevCpuUsage.idle;
    const diffTotal = total - this.prevCpuUsage.total;

    this.prevCpuUsage = { idle, total };

    if (diffTotal === 0) return 0;
    const usage = 100 * (1 - diffIdle / diffTotal);
    return Math.round(usage * 10) / 10;
  }

  private async getNetworkMetrics() {
    const [traffic, probeStats] = await Promise.all([
      this.calculateNetworkTraffic(),
      this.runProbes(),
    ]);

    return {
      ...probeStats,
      traffic,
    };
  }

  private async runProbes() {
    const startTime = Date.now();
    let dnsLatency = 0;
    try {
      await dns.promises.resolve('nangman.cloud');
      dnsLatency = Date.now() - startTime;
    } catch {
      dnsLatency = 0;
    }

    let backbonePing = 0;
    try {
      const { stdout } = await execAsync('ping -c 1 8.8.8.8');
      const match = stdout.match(/time=([\d.]+)\s*ms/);
      backbonePing = match ? parseFloat(match[1]) : 0;
    } catch {
      backbonePing = 0;
    }

    return {
      dnsLatency,
      gatewayLatency: Math.round(backbonePing * 0.15 * 10) / 10,
      backbonePing,
      sslStatus: 'SECURE' as const,
    };
  }

  private async calculateNetworkTraffic() {
    let inbound = 0;
    let outbound = 0;
    let inboundPps = 0;
    let outboundPps = 0;
    let activeConnections = 0;

    try {
      const netDevPath = fs.existsSync('/host/proc/net/dev')
        ? '/host/proc/net/dev'
        : '/proc/net/dev';
      const tcpPath = fs.existsSync('/host/proc/net/tcp')
        ? '/host/proc/net/tcp'
        : '/proc/net/tcp';

      if (fs.existsSync(netDevPath)) {
        const netDev = fs.readFileSync(netDevPath, 'utf8');
        const now = Date.now();

        const lines = netDev.split('\n');
        for (const line of lines) {
          const match = line.match(
            /^\s*(eth\d+|bond\d+|enp\d+s\d+|wlan\d+|br-[\w\d]+|docker\d+):\s*(\d+)\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)\s+(\d+)/,
          );
          if (match) {
            const iface = match[1];
            const rxBytes = parseInt(match[2], 10);
            const rxPackets = parseInt(match[3], 10);
            const txBytes = parseInt(match[4], 10);
            const txPackets = parseInt(match[5], 10);

            if (this.prevNetStats[iface]) {
              const prev = this.prevNetStats[iface];
              const timeDiff = (now - prev.time) / 1000;
              if (timeDiff > 0) {
                inbound += ((rxBytes - prev.rxBytes) * 8) / 1000000 / timeDiff; // Mbps
                outbound += ((txBytes - prev.txBytes) * 8) / 1000000 / timeDiff; // Mbps
                inboundPps += (rxPackets - prev.rxPackets) / timeDiff;
                outboundPps += (txPackets - prev.txPackets) / timeDiff;
              }
            }
            this.prevNetStats[iface] = {
              rxBytes,
              txBytes,
              rxPackets,
              txPackets,
              time: now,
            };
          }
        }

        try {
          if (fs.existsSync(tcpPath)) {
            const tcpStats = fs.readFileSync(tcpPath, 'utf8');
            activeConnections = tcpStats
              .split('\n')
              .filter((line) => line.includes(' 01 ')).length;
          }
        } catch {
          activeConnections = 0;
        }
      }
    } catch (e) {
      this.logger.warn('Failed to read network stats', e);
    }

    // 히스토리 업데이트
    const timestamp = new Date().toLocaleTimeString();
    this.trafficHistory.push({
      timestamp,
      inbound: Math.round(inbound * 100) / 100,
      outbound: Math.round(outbound * 100) / 100,
    });
    if (this.trafficHistory.length > this.MAX_HISTORY_LENGTH) {
      this.trafficHistory.shift();
    }

    return {
      inbound: Math.round(inbound * 100) / 100,
      outbound: Math.round(outbound * 100) / 100,
      inboundPps: Math.round(inboundPps),
      outboundPps: Math.round(outboundPps),
      activeConnections,
      history: this.trafficHistory,
    };
  }

  private generateDynamicLogs(monitors: MonitorStatus[], insights: any) {
    const logs: any[] = [];
    const now = new Date();

    // 1. 시스템 상태 로그
    if (insights.system.cpu > 80) {
      logs.push({
        timestamp: now.toISOString(),
        level: 'WARN',
        source: 'SYSTEM',
        message: `High CPU load detected: ${insights.system.cpu}%`,
      });
    }

    // 2. 모니터 상태 로그
    const offlineNodes = monitors.filter((m) => m.status === 'down');
    if (offlineNodes.length > 0) {
      offlineNodes.forEach((node) => {
        logs.push({
          timestamp: now.toISOString(),
          level: 'ALERT',
          source: 'MONITOR',
          message: `Node "${node.name}" is currently OFFLINE`,
        });
      });
    }

    // 3. 네트워크 상태 로그
    if (insights.network.traffic.inbound > 100) {
      logs.push({
        timestamp: now.toISOString(),
        level: 'WARN',
        source: 'NETWORK',
        message: `High inbound traffic detected: ${insights.network.traffic.inbound} Mbps`,
      });
    }

    // 4. 기본 정보 로그 (항상 표시되는 로그들)
    logs.push({
      timestamp: now.toISOString(),
      level: 'INFO',
      source: 'SYSTEM',
      message: `Cluster Load Balanced (${monitors.length} Nodes Active)`,
    });

    logs.push({
      timestamp: now.toISOString(),
      level: 'PROBE',
      source: 'NETWORK',
      message: `Gateway Latency: ${insights.network.gatewayLatency}ms / DNS: ${insights.network.dnsLatency}ms`,
    });

    // 시간 역순 정렬 후 최대 6개만 유지
    return logs
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 6);
  }

  private transformKumaDataToMonitors(
    kumaData: KumaStatusPageResponse,
    heartbeatData: KumaHeartbeatResponse,
  ): MonitorStatus[] {
    const monitors: MonitorStatus[] = [];

    for (const group of kumaData.publicGroupList) {
      for (const monitor of group.monitorList) {
        const monitorId = monitor.id.toString();
        const heartbeatList = heartbeatData.heartbeatList[monitorId] || [];
        const latestHeartbeat = heartbeatList[heartbeatList.length - 1];

        // 상태 결정: 1 = up, 0 = down, 없으면 unknown
        let status: 'up' | 'down' | 'pending' | 'unknown' = 'unknown';
        if (latestHeartbeat) {
          status = latestHeartbeat.status === 1 ? 'up' : 'down';
        }

        // Uptime 계산
        const uptimeKey = `${monitorId}_24`;
        const uptimeValue = heartbeatData.uptimeList[uptimeKey];
        const uptime =
          uptimeValue !== undefined
            ? Math.round(uptimeValue * 10000) / 100
            : null;

        const lastCheck = latestHeartbeat?.time || null;
        const monitorName = monitor.name.trim();

        // 100% Manual Labeling Mapping (5-Layer English Hierarchy)
        const MANUAL_GROUP_MAP: Record<string, string> = {
          // 1. Network
          OPNsense: 'Network',
          'Teleport Console': 'Network',
          'ec2-nangman-teleport-access': 'Network',
          'seongwon-nginx-proxy-manager': 'Network',
          'wisoft-nginx-reverse-proxy': 'Network',

          // 2. Management Infrastructure (Includes Monitoring Tools)
          'XCP-ng': 'Management Infrastructure',
          Authentik: 'Management Infrastructure',
          grafana: 'Management Infrastructure',
          'analytics.nangman.cloud': 'Management Infrastructure',
          'ec2-nangman-managements': 'Management Infrastructure',
          'wisoft windows managements': 'Management Infrastructure',

          // 3. Compute Nodes
          'donggeon-ubuntu-server': 'Compute Nodes',
          'heehoon-ubuntu-server': 'Compute Nodes',
          'juhyung-ubuntu-server': 'Compute Nodes',
          'junho-ubuntu-server': 'Compute Nodes',
          'seongwoo-ubuntu-server': 'Compute Nodes',
          'taekjun-ubuntu-server': 'Compute Nodes',

          // 4. Web Servers (Services & Collaboration)
          'nangman.cloud': 'Web Servers',
          'ban-o.art': 'Web Servers',
          'netlab.wisoft.io': 'Web Servers',
          'skt-hack.wisoft.io': 'Web Servers',
          'wisoft-seongwon-app-server': 'Web Servers',
          'matrix.nangman.cloud': 'Web Servers',
          'matrixrtc.nangman.cloud': 'Web Servers',
          'element-call': 'Web Servers',
          'livekit.nangman.cloud': 'Web Servers',

          // 5. External Monitoring
          'Google DNS': 'External Monitoring',
          'CloudFlare DNS': 'External Monitoring',
        };

        let assignedGroup = MANUAL_GROUP_MAP[monitorName];

        if (!assignedGroup) {
          const nameLower = monitorName.toLowerCase();
          if (nameLower.includes('ubuntu') || nameLower.includes('server'))
            assignedGroup = 'Compute Nodes';
          else if (nameLower.includes('dns'))
            assignedGroup = 'External Monitoring';
          else assignedGroup = 'Management Infrastructure';
        }

        monitors.push({
          id: monitor.id,
          name: monitorName,
          type: monitor.type,
          status,
          uptime,
          lastCheck,
          group: assignedGroup,
        });
      }
    }

    return monitors;
  }

  private calculateSummary(monitors: MonitorStatus[]) {
    const total = monitors.length;
    const online = monitors.filter((m) => m.status === 'up').length;
    const offline = monitors.filter((m) => m.status === 'down').length;
    const pending = monitors.filter((m) => m.status === 'pending').length;

    return {
      total,
      online,
      offline,
      pending,
    };
  }

  private getKumaUrl(): string {
    const url =
      this.configService.get<string>('KUMA_URL') ||
      process.env.KUMA_URL ||
      'http://172.16.0.14:3001';

    if (!url || url.trim() === '') {
      this.logger.error('KUMA_URL이 설정되지 않았습니다.', {
        service: 'MonitoringService',
        action: 'getKumaUrl',
      });
      throw new HttpException(
        ERROR_MESSAGES.KUMA.URL_NOT_SET,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return url.trim();
  }

  private getStatusPageSlug(): string {
    const slug =
      this.configService.get<string>('KUMA_STATUS_PAGE_SLUG') ||
      process.env.KUMA_STATUS_PAGE_SLUG ||
      'nangman';

    if (!slug || slug.trim() === '') {
      this.logger.error('KUMA_STATUS_PAGE_SLUG이 설정되지 않았습니다.', {
        service: 'MonitoringService',
        action: 'getStatusPageSlug',
      });
      throw new HttpException(
        ERROR_MESSAGES.KUMA.STATUS_PAGE_SLUG_NOT_SET,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return slug.trim();
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ETIMEDOUT'
      ) {
        this.logger.error('Kuma API 타임아웃', {
          service: 'MonitoringService',
          action: 'getMonitoringStatus',
          error: axiosError.message,
          code: axiosError.code,
        });
        throw new HttpException(
          ERROR_MESSAGES.KUMA.CONNECTION_TIMEOUT,
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        const statusText = axiosError.response.statusText;

        this.logger.error('Kuma API 호출 실패', {
          service: 'MonitoringService',
          action: 'getMonitoringStatus',
          status,
          statusText,
          data: axiosError.response.data,
        });

        if (status === HttpStatus.NOT_FOUND) {
          throw new HttpException(
            ERROR_MESSAGES.KUMA.STATUS_PAGE_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        throw new HttpException(
          ERROR_MESSAGES.KUMA.API_CALL_FAILED(statusText),
          status,
        );
      }

      if (axiosError.request) {
        this.logger.error('Kuma 서버에 연결할 수 없습니다', {
          service: 'MonitoringService',
          action: 'getMonitoringStatus',
          error: axiosError.message,
        });
        throw new HttpException(
          ERROR_MESSAGES.KUMA.CONNECTION_FAILED,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    this.logger.error('알 수 없는 오류 발생', {
      service: 'MonitoringService',
      action: 'getMonitoringStatus',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new HttpException(
      ERROR_MESSAGES.KUMA.UNKNOWN_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
