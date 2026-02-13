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
  KumaMonitor,
  KumaHeartbeat,
  MonitorStatus,
  MonitoringStatusResponse,
  MonitoringLog,
  InsightsData,
  SystemInsights,
  NetworkInsights,
} from './monitoring.dto';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import {
  UPS_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS,
  CPU_HIGH_THRESHOLD_PERCENT,
  NETWORK_TRAFFIC_HIGH_THRESHOLD_MBPS,
  MAX_LOG_DISPLAY_COUNT,
  MAX_TRAFFIC_HISTORY_LENGTH,
  PERCENTAGE_MULTIPLIER,
  BYTES_TO_MBPS_DIVISOR,
  BITS_PER_BYTE,
  MS_TO_SECONDS_DIVISOR,
  UPTIME_PRECISION_MULTIPLIER,
  UPTIME_PRECISION_DIVISOR,
  GATEWAY_LATENCY_MULTIPLIER,
  DECIMAL_PRECISION_MULTIPLIER,
  DECIMAL_PRECISION_DIVISOR,
  DEFAULT_IOWAIT_VALUE,
  DEFAULT_NUT_SERVER_URL,
  DEFAULT_NUT_UPS_NAME,
  DEFAULT_KUMA_URL,
  DEFAULT_KUMA_STATUS_PAGE_SLUG,
  DNS_PROBE_HOSTNAME,
  BACKBONE_PING_TARGET,
} from '../../common/constants/monitoring';

const execAsync = promisify(exec);

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
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

  /**
   * 수동 그룹 매핑 (5-Layer Hierarchical Structure)
   * 서버 이름을 계층 구조에 맞게 매핑
   */
  private static readonly MANUAL_GROUP_MAP: Readonly<Record<string, string>> = {
    // 1. Network Layer (네트워크 계층)
    OPNsense: 'Network Layer',
    'Teleport Console': 'Network Layer',
    'ec2-nangman-teleport-access': 'Network Layer',
    'seongwon-nginx-proxy-manager': 'Network Layer',
    'wisoft-nginx-reverse-proxy': 'Network Layer',
    // 네트워크 장비
    'UniFi Networks': 'Network Layer',
    'UniFi Security Gateway': 'Network Layer',
    'TPLINK-ER7206': 'Network Layer',

    // 2. Infrastructure Layer (인프라 계층)
    'XCP-ng': 'Infrastructure Layer',
    'donggeon-ubuntu-server': 'Infrastructure Layer',
    'heehoon-ubuntu-server': 'Infrastructure Layer',
    'juhyung-ubuntu-server': 'Infrastructure Layer',
    'junho-ubuntu-server': 'Infrastructure Layer',
    'seongwoo-ubuntu-server': 'Infrastructure Layer',
    'taekjun-ubuntu-server': 'Infrastructure Layer',
    'wisoft-nangman-build-server': 'Infrastructure Layer',
    'rustfs.nangman.cloud': 'Infrastructure Layer',

    // 3. Platform Services (플랫폼 서비스)
    Authentik: 'Platform Services',
    grafana: 'Platform Services',
    'analytics.nangman.cloud': 'Platform Services',
    'ec2-nangman-managements': 'Platform Services',
    'wisoft windows managements': 'Platform Services',
    jenkins: 'Platform Services',
    'harbor.nangman.cloud': 'Platform Services',

    // 4. Applications (애플리케이션)
    'nangman.cloud': 'Applications',
    'ban-o.art': 'Applications',
    'netlab.wisoft.io': 'Applications',
    'skt-hack.wisoft.io': 'Applications',
    'wisoft-seongwon-app-server': 'Applications',
    'matrix.nangman.cloud': 'Applications',
    'matrixrtc.nangman.cloud': 'Applications',
    'element-call': 'Applications',
    'livekit.nangman.cloud': 'Applications',
    Mattermost: 'Applications',

    // 5. External Services (외부 서비스)
    'Google DNS': 'External Services',
    'CloudFlare DNS': 'External Services',
  } as const;

  constructor(private readonly configService: ConfigService) {}

  /**
   * 모니터링 상태 조회
   * Kuma API에서 데이터를 가져와 변환하고 인사이트를 수집하여 반환
   *
   * @returns {Promise<MonitoringStatusResponse>} 모니터링 상태 응답
   * @throws {HttpException} Kuma API 연결 실패 시
   */
  async getMonitoringStatus(): Promise<MonitoringStatusResponse> {
    const kumaUrl = this.getKumaUrl();
    const slug = this.getStatusPageSlug();

    try {
      const [statusPageResponse, heartbeatResponse, insights] =
        await Promise.all([
          axios.get<KumaStatusPageResponse>(
            `${kumaUrl}/api/status-page/${slug}`,
            {
              timeout: DEFAULT_TIMEOUT_MS,
              headers: { Accept: 'application/json' },
            },
          ),
          axios.get<KumaHeartbeatResponse>(
            `${kumaUrl}/api/status-page/heartbeat/${slug}`,
            {
              timeout: DEFAULT_TIMEOUT_MS,
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
    } catch (error: unknown) {
      // handleError가 HttpException을 throw하므로 여기서는 에러 변환만 수행
      this.handleError(error);
    }
  }

  /**
   * 시스템 인사이트 수집
   * 시스템 메트릭, 네트워크 메트릭, UPS 상태를 병렬로 수집
   */
  private async collectInsights(): Promise<InsightsData> {
    const [system, network, ups] = await Promise.all([
      this.getSystemMetrics(),
      this.getNetworkMetrics(),
      this.getUPSStatus().catch((error: unknown) => {
        // UPS 실패 시 에러 정보를 로깅하고 null 반환
        this.logger.debug('UPS 상태 수집 실패 (무시됨)', {
          service: 'MonitoringService',
          action: 'collectInsights',
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }),
    ]);

    return {
      system,
      network,
      ...(ups && { ups }), // UPS 정보가 있을 때만 포함
    };
  }

  /**
   * 시스템 메트릭 수집
   * CPU, 메모리, Load Average, I/O Wait 등을 수집
   *
   * @returns {Promise<SystemInsights>} 시스템 인사이트 데이터
   */
  private async getSystemMetrics(): Promise<SystemInsights> {
    const load = os.loadavg() as [number, number, number];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = (usedMem / totalMem) * PERCENTAGE_MULTIPLIER;

    const cpuUsage = await this.calculateCpuUsage();

    let ioWait = DEFAULT_IOWAIT_VALUE;
    try {
      if (process.platform === 'linux') {
        const stats = fs.readFileSync('/proc/stat', 'utf8');
        const cpuLine = stats
          .split('\n')
          .find((line) => line.startsWith('cpu '));
        if (cpuLine) {
          const parts = cpuLine.split(/\s+/);
          // /proc/stat 형식: cpu user nice system idle iowait irq softirq
          // iowait는 parts[5]에 위치하며, 전체 CPU 시간 대비 비율로 계산해야 함
          if (parts.length >= 6) {
            const iowaitTime = parseInt(parts[5], 10);
            const totalCpuTime = parts
              .slice(1, 11)
              .reduce((sum, val) => sum + parseInt(val, 10), 0);
            if (totalCpuTime > 0) {
              ioWait =
                Math.round(
                  (iowaitTime / totalCpuTime) *
                    PERCENTAGE_MULTIPLIER *
                    DECIMAL_PRECISION_MULTIPLIER,
                ) / DECIMAL_PRECISION_DIVISOR;
            }
          }
        }
      }
    } catch (error: unknown) {
      // I/O Wait 계산 실패 시 기본값 사용
      this.logger.debug('I/O Wait 계산 실패 (기본값 사용)', {
        service: 'MonitoringService',
        action: 'getSystemMetrics',
        error: error instanceof Error ? error.message : String(error),
      });
      ioWait = DEFAULT_IOWAIT_VALUE;
    }

    return {
      load: load.map(
        (v) => Math.round(v * PERCENTAGE_MULTIPLIER) / PERCENTAGE_MULTIPLIER,
      ) as [number, number, number],
      cpu: cpuUsage,
      memory: {
        used: usedMem,
        total: totalMem,
        percentage:
          Math.round(memPercentage * DECIMAL_PRECISION_MULTIPLIER) /
          DECIMAL_PRECISION_DIVISOR,
      },
      ioWait,
      stealTime: 0.0,
    };
  }

  /**
   * CPU 사용률 계산
   * 이전 측정값과의 차이를 기반으로 CPU 사용률을 계산
   *
   * @returns {Promise<number>} CPU 사용률 (0-100)
   */
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
    const usage = PERCENTAGE_MULTIPLIER * (1 - diffIdle / diffTotal);
    return (
      Math.round(usage * DECIMAL_PRECISION_MULTIPLIER) /
      DECIMAL_PRECISION_DIVISOR
    );
  }

  /**
   * 네트워크 메트릭 수집
   * 트래픽 통계와 네트워크 프로브 결과를 수집
   *
   * @returns {Promise<NetworkInsights>} 네트워크 인사이트 데이터
   */
  private async getNetworkMetrics(): Promise<NetworkInsights> {
    const [traffic, probeStats] = await Promise.all([
      this.calculateNetworkTraffic(),
      this.runProbes(),
    ]);

    return {
      ...probeStats,
      traffic,
    };
  }

  /**
   * 네트워크 프로브 실행
   * DNS 레이턴시와 백본 핑을 측정
   *
   * @returns {Promise<Omit<NetworkInsights, 'traffic'>>} 네트워크 프로브 결과
   */
  private async runProbes(): Promise<Omit<NetworkInsights, 'traffic'>> {
    const startTime = Date.now();
    let dnsLatency = 0;
    try {
      await dns.promises.resolve(DNS_PROBE_HOSTNAME);
      dnsLatency = Date.now() - startTime;
    } catch (error: unknown) {
      this.logger.warn('DNS 조회 실패', {
        service: 'MonitoringService',
        action: 'runProbes',
        hostname: DNS_PROBE_HOSTNAME,
        error: error instanceof Error ? error.message : String(error),
      });
      dnsLatency = 0;
    }

    let backbonePing = 0;
    try {
      // IP 주소 형식 검증 (간단한 IPv4 검증)
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(BACKBONE_PING_TARGET)) {
        throw new Error(`Invalid IP address format: ${BACKBONE_PING_TARGET}`);
      }
      const { stdout } = await execAsync(`ping -c 1 ${BACKBONE_PING_TARGET}`);
      const match = stdout.match(/time=([\d.]+)\s*ms/);
      backbonePing = match ? parseFloat(match[1]) : 0;
    } catch (error: unknown) {
      this.logger.warn('백본 핑 실패', {
        service: 'MonitoringService',
        action: 'runProbes',
        target: BACKBONE_PING_TARGET,
        error: error instanceof Error ? error.message : String(error),
      });
      backbonePing = 0;
    }

    return {
      dnsLatency,
      gatewayLatency:
        Math.round(
          backbonePing *
            GATEWAY_LATENCY_MULTIPLIER *
            DECIMAL_PRECISION_MULTIPLIER,
        ) / DECIMAL_PRECISION_DIVISOR,
      backbonePing,
      sslStatus: 'SECURE' as const,
    };
  }

  /**
   * 네트워크 트래픽 계산
   * /proc/net/dev 파일을 읽어 네트워크 트래픽 통계를 계산
   *
   * @returns {Promise<NetworkInsights['traffic']>} 네트워크 트래픽 데이터
   */
  private async calculateNetworkTraffic(): Promise<NetworkInsights['traffic']> {
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
              const timeDiff = (now - prev.time) / MS_TO_SECONDS_DIVISOR;
              if (timeDiff > 0) {
                inbound +=
                  ((rxBytes - prev.rxBytes) * BITS_PER_BYTE) /
                  BYTES_TO_MBPS_DIVISOR /
                  timeDiff; // Mbps
                outbound +=
                  ((txBytes - prev.txBytes) * BITS_PER_BYTE) /
                  BYTES_TO_MBPS_DIVISOR /
                  timeDiff; // Mbps
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
        } catch (error: unknown) {
          // TCP 연결 수 계산 실패 시 0으로 설정
          this.logger.debug('TCP 연결 수 계산 실패', {
            service: 'MonitoringService',
            action: 'calculateNetworkTraffic',
            error: error instanceof Error ? error.message : String(error),
          });
          activeConnections = 0;
        }
      }
    } catch (error: unknown) {
      this.logger.warn('Failed to read network stats', {
        service: 'MonitoringService',
        action: 'calculateNetworkTraffic',
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // 히스토리 업데이트
    const timestamp = new Date().toLocaleTimeString();
    const roundedInbound = this.roundToDecimalPlaces(
      inbound,
      PERCENTAGE_MULTIPLIER,
    );
    const roundedOutbound = this.roundToDecimalPlaces(
      outbound,
      PERCENTAGE_MULTIPLIER,
    );

    this.trafficHistory.push({
      timestamp,
      inbound: roundedInbound,
      outbound: roundedOutbound,
    });
    if (this.trafficHistory.length > MAX_TRAFFIC_HISTORY_LENGTH) {
      this.trafficHistory.shift();
    }

    return {
      inbound: roundedInbound,
      outbound: roundedOutbound,
      inboundPps: Math.round(inboundPps),
      outboundPps: Math.round(outboundPps),
      activeConnections,
      history: this.trafficHistory,
    };
  }

  /**
   * 소수점 반올림 헬퍼 함수
   * 중복된 반올림 로직을 통합
   */
  private roundToDecimalPlaces(value: number, multiplier: number): number {
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * 동적 로그 생성
   * 시스템 상태, 모니터 상태, 네트워크 상태를 기반으로 로그 생성
   *
   * @param {MonitorStatus[]} monitors - 모니터 상태 목록
   * @param {InsightsData} insights - 인사이트 데이터
   * @returns {MonitoringLog[]} 생성된 로그 목록
   */
  private generateDynamicLogs(
    monitors: MonitorStatus[],
    insights: InsightsData,
  ): MonitoringLog[] {
    const logs: MonitoringLog[] = [];
    const now = new Date();

    // 1. 시스템 상태 로그
    if (insights.system.cpu > CPU_HIGH_THRESHOLD_PERCENT) {
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
    if (
      insights.network.traffic.inbound > NETWORK_TRAFFIC_HIGH_THRESHOLD_MBPS
    ) {
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

    // 시간 역순 정렬 후 최대 개수만 유지
    return logs
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, MAX_LOG_DISPLAY_COUNT);
  }

  /**
   * Kuma 데이터를 MonitorStatus 배열로 변환
   * Kuma API 응답을 내부 모니터 상태 형식으로 변환하고 그룹 분류 수행
   *
   * @param {KumaStatusPageResponse} kumaData - Kuma 상태 페이지 응답
   * @param {KumaHeartbeatResponse} heartbeatData - Kuma 하트비트 응답
   * @returns {MonitorStatus[]} 변환된 모니터 상태 목록
   */
  private transformKumaDataToMonitors(
    kumaData: KumaStatusPageResponse,
    heartbeatData: KumaHeartbeatResponse,
  ): MonitorStatus[] {
    const monitors: MonitorStatus[] = [];

    for (const group of kumaData.publicGroupList) {
      for (const monitor of group.monitorList) {
        const monitorStatus = this.transformKumaMonitorToStatus(
          monitor,
          heartbeatData,
        );
        monitors.push(monitorStatus);
      }
    }

    return monitors;
  }

  /**
   * 단일 Kuma 모니터를 MonitorStatus로 변환
   *
   * @param {KumaMonitor} monitor - Kuma 모니터 객체
   * @param {KumaHeartbeatResponse} heartbeatData - 하트비트 데이터
   * @returns {MonitorStatus} 변환된 모니터 상태
   */
  private transformKumaMonitorToStatus(
    monitor: KumaMonitor,
    heartbeatData: KumaHeartbeatResponse,
  ): MonitorStatus {
    const monitorId = monitor.id.toString();
    const heartbeatList = heartbeatData.heartbeatList[monitorId] || [];
    const latestHeartbeat = heartbeatList[heartbeatList.length - 1];

    const status = this.determineMonitorStatus(latestHeartbeat);
    const uptime = this.calculateUptime(monitorId, heartbeatData);
    const lastCheck = latestHeartbeat?.time || null;
    const monitorName = monitor.name.trim();
    const group = this.determineMonitorGroup(monitorName);

    return {
      id: monitor.id,
      name: monitorName,
      type: monitor.type,
      status,
      uptime,
      lastCheck,
      group,
    };
  }

  /**
   * 모니터 상태 결정
   *
   * @param {KumaHeartbeat | undefined} latestHeartbeat - 최신 하트비트 데이터
   * @returns {MonitorStatus['status']} 모니터 상태
   */
  private determineMonitorStatus(
    latestHeartbeat: KumaHeartbeat | undefined,
  ): MonitorStatus['status'] {
    if (!latestHeartbeat) {
      return 'unknown';
    }
    return latestHeartbeat.status === 1 ? 'up' : 'down';
  }

  /**
   * Uptime 계산
   *
   * @param {string} monitorId - 모니터 ID
   * @param {KumaHeartbeatResponse} heartbeatData - 하트비트 데이터
   * @returns {number | null} Uptime 값 (0-100) 또는 null
   */
  private calculateUptime(
    monitorId: string,
    heartbeatData: KumaHeartbeatResponse,
  ): number | null {
    const uptimeKey = `${monitorId}_24`;
    const uptimeValue = heartbeatData.uptimeList[uptimeKey];
    if (uptimeValue === undefined) {
      return null;
    }
    return (
      Math.round(uptimeValue * UPTIME_PRECISION_MULTIPLIER) /
      UPTIME_PRECISION_DIVISOR
    );
  }

  /**
   * 모니터 그룹 결정
   * 수동 매핑을 먼저 확인하고, 없으면 패턴 기반 자동 분류 수행
   *
   * @param {string} monitorName - 모니터 이름
   * @returns {string} 그룹 이름
   */
  private determineMonitorGroup(monitorName: string): string {
    return (
      MonitoringService.MANUAL_GROUP_MAP[monitorName] ||
      this.classifyByPattern(monitorName)
    );
  }

  /**
   * 패턴 기반 자동 분류 함수
   * 수동 매핑에 없는 서버를 계층 구조에 맞게 자동 분류
   * 우선순위: External Services > Network Layer > Infrastructure Layer > Applications > Platform Services
   */
  private classifyByPattern(monitorName: string): string {
    const nameLower = monitorName.toLowerCase();

    // 우선순위에 따라 분류
    if (this.isExternalService(nameLower)) {
      return 'External Services';
    }
    if (this.isNetworkLayer(nameLower)) {
      return 'Network Layer';
    }
    if (this.isInfrastructureLayer(nameLower, monitorName)) {
      return 'Infrastructure Layer';
    }
    if (this.isApplication(nameLower, monitorName)) {
      return 'Applications';
    }
    if (this.isPlatformService(nameLower)) {
      return 'Platform Services';
    }
    // 기본값: Platform Services
    return 'Platform Services';
  }

  /**
   * Platform Services 패턴 검사
   */
  private isPlatformService(nameLower: string): boolean {
    // 인증/권한 관리
    if (
      nameLower.includes('authentik') ||
      nameLower.includes('auth') ||
      nameLower.includes('ldap') ||
      nameLower.includes('sso')
    ) {
      return true;
    }

    // 모니터링/분석
    if (
      nameLower.includes('grafana') ||
      nameLower.includes('analytics') ||
      nameLower.includes('prometheus') ||
      nameLower.includes('zabbix') ||
      nameLower.includes('nagios') ||
      nameLower.includes('monitoring')
    ) {
      return true;
    }

    // CI/CD 도구
    if (
      nameLower.includes('jenkins') ||
      nameLower.includes('gitlab') ||
      nameLower.includes('github') ||
      nameLower.includes('ci/cd') ||
      nameLower.includes('pipeline')
    ) {
      return true;
    }

    // 컨테이너 레지스트리
    if (
      nameLower.includes('harbor') ||
      nameLower.includes('registry') ||
      nameLower.includes('docker-registry')
    ) {
      return true;
    }

    // 관리 서버
    return (
      nameLower.includes('management') ||
      nameLower.includes('managements') ||
      nameLower.includes('console.nangman.cloud') ||
      nameLower.includes('admin')
    );
  }

  /**
   * External Services 패턴 검사
   */
  private isExternalService(nameLower: string): boolean {
    return (
      nameLower.includes('dns') ||
      nameLower.includes('google') ||
      nameLower.includes('cloudflare') ||
      nameLower.includes('external')
    );
  }

  /**
   * Network Layer 패턴 검사
   */
  private isNetworkLayer(nameLower: string): boolean {
    // 네트워크 장비 브랜드/제품
    if (
      nameLower.includes('unifi') ||
      nameLower.includes('tplink') ||
      nameLower.includes('tp-link') ||
      nameLower.includes('opnsense')
    ) {
      return true;
    }

    // 네트워크 기능
    return (
      nameLower.includes('teleport') ||
      nameLower.includes('nginx') ||
      nameLower.includes('proxy') ||
      nameLower.includes('reverse-proxy') ||
      nameLower.includes('gateway') ||
      nameLower.includes('firewall') ||
      nameLower.includes('router') ||
      nameLower.includes('switch') ||
      nameLower.includes('ap-') ||
      nameLower.includes('access-point') ||
      nameLower.includes('wifi') ||
      nameLower.includes('wireless')
    );
  }

  /**
   * Infrastructure Layer 패턴 검사
   */
  private isInfrastructureLayer(
    nameLower: string,
    monitorName: string,
  ): boolean {
    // 하이퍼바이저
    if (
      nameLower.includes('xcp') ||
      nameLower.includes('hypervisor') ||
      nameLower.includes('vmware') ||
      nameLower.includes('proxmox')
    ) {
      return true;
    }

    // 서버 패턴 (정확한 매칭)
    if (
      /-ubuntu-server$/i.test(monitorName) ||
      /ubuntu.*server$/i.test(monitorName)
    ) {
      return true;
    }

    // 빌드/컴파일 서버
    if (nameLower.includes('build-server') || nameLower.includes('build')) {
      return true;
    }

    // 스토리지/파일 서버
    if (
      nameLower.includes('rustfs') ||
      nameLower.includes('storage') ||
      nameLower.includes('nas') ||
      nameLower.includes('fileserver')
    ) {
      return true;
    }

    // EC2 인스턴스 (인프라)
    if (nameLower.includes('ec2') && nameLower.includes('server')) {
      return true;
    }

    // 일반 서버 (단, app-server, managements 제외)
    return (
      nameLower.includes('server') &&
      !nameLower.includes('app-server') &&
      !nameLower.includes('management')
    );
  }

  /**
   * Applications 패턴 검사
   */
  private isApplication(nameLower: string, monitorName: string): boolean {
    // 협업 도구
    if (
      nameLower.includes('matrix') ||
      nameLower.includes('element') ||
      nameLower.includes('livekit') ||
      nameLower.includes('mattermost') ||
      nameLower.includes('slack') ||
      nameLower.includes('discord')
    ) {
      return true;
    }

    // 앱 서버
    if (nameLower.includes('app-server')) {
      return true;
    }

    // 도메인 패턴 (단, console.nangman.cloud, analytics 제외)
    if (
      /\.(cloud|art|io|com|net|org)$/i.test(monitorName) &&
      !nameLower.includes('console.nangman.cloud') &&
      !nameLower.includes('analytics') &&
      !nameLower.includes('harbor') &&
      !nameLower.includes('grafana')
    ) {
      return true;
    }

    // 일반 웹사이트/서비스
    return (
      nameLower.includes('website') ||
      nameLower.includes('webapp') ||
      nameLower.includes('app.')
    );
  }

  /**
   * 모니터 요약 정보 계산
   * 전체, 온라인, 오프라인, 대기 중인 모니터 수를 계산
   *
   * @param {MonitorStatus[]} monitors - 모니터 상태 목록
   * @returns {MonitoringStatusResponse['data']['summary']} 요약 정보
   */
  private calculateSummary(
    monitors: MonitorStatus[],
  ): MonitoringStatusResponse['data']['summary'] {
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

  /**
   * 입력 값 검증 및 sanitization
   * 명령어 인젝션 방지를 위한 검증
   */
  private validateUPSInput(value: string, defaultValue: string): string {
    // 허용된 문자만 사용: 영문자, 숫자, 점(.), 하이픈(-), 콜론(:), 언더스코어(_)
    const sanitized = value.replace(/[^a-zA-Z0-9.\-:_]/g, '');
    if (!sanitized || sanitized.length === 0) {
      return defaultValue;
    }
    // 길이 제한 (보안상 255자로 제한)
    return sanitized.length > 255 ? defaultValue : sanitized;
  }

  /**
   * UPS 상태 조회
   * NUT 서버를 통해 UPS 정보를 조회하고 파싱
   *
   * @returns {Promise<InsightsData['ups'] | null>} UPS 상태 정보 또는 null
   */
  private async getUPSStatus(): Promise<InsightsData['ups'] | null> {
    const rawNutServerUrl =
      this.configService.get<string>('NUT_SERVER_URL') ||
      process.env.NUT_SERVER_URL ||
      DEFAULT_NUT_SERVER_URL;
    const rawUpsName =
      this.configService.get<string>('NUT_UPS_NAME') ||
      process.env.NUT_UPS_NAME ||
      DEFAULT_NUT_UPS_NAME;

    // 입력 값 검증 및 sanitization
    const nutServerUrl = this.validateUPSInput(
      rawNutServerUrl,
      DEFAULT_NUT_SERVER_URL,
    );
    const upsName = this.validateUPSInput(rawUpsName, DEFAULT_NUT_UPS_NAME);

    try {
      // upsc 명령어로 UPS 정보 조회
      // 형식: upsc ups@192.168.10.3:3493
      // 입력 값은 이미 검증되었으므로 안전하게 사용 가능
      const command = `upsc ${upsName}@${nutServerUrl}`;
      const { stdout } = await execAsync(command, {
        timeout: UPS_TIMEOUT_MS,
      });

      // upsc 출력 파싱 (key: value 형식)
      const upsData: Record<string, string> = {};
      stdout.split('\n').forEach((line) => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          upsData[key.trim()] = value.trim();
        }
      });

      // UPS 상태 파싱
      const status = this.parseUPSStatus(upsData['ups.status'] || 'UNKNOWN');
      const batteryCharge = this.parseNumber(upsData['battery.charge']);
      const batteryVoltage = this.parseNumber(upsData['battery.voltage']);
      const batteryVoltageNominal = this.parseNumber(
        upsData['battery.voltage.nominal'],
      );
      const inputVoltage = this.parseNumber(upsData['input.voltage']);
      const inputVoltageNominal = this.parseNumber(
        upsData['input.voltage.nominal'],
      );
      const outputVoltage = this.parseNumber(upsData['output.voltage']);
      const load = this.parseNumber(upsData['ups.load']);
      const realpowerNominal = this.parseNumber(
        upsData['ups.realpower.nominal'],
      );
      const temperature = this.parseNumber(upsData['battery.temperature']);
      const runtimeRemaining = this.parseNumber(upsData['battery.runtime']);

      // 현재 소비전력 계산 (부하율 * 정격 전력)
      const currentPower =
        load !== null && realpowerNominal !== null
          ? Math.round((load / PERCENTAGE_MULTIPLIER) * realpowerNominal)
          : null;

      return {
        status,
        batteryCharge,
        batteryVoltage,
        batteryVoltageNominal,
        inputVoltage,
        inputVoltageNominal,
        outputVoltage,
        load,
        realpowerNominal,
        currentPower,
        temperature,
        runtimeRemaining,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error: unknown) {
      this.logger.warn('UPS 정보를 가져오는데 실패했습니다', {
        service: 'MonitoringService',
        action: 'getUPSStatus',
        error: error instanceof Error ? error.message : String(error),
        nutServerUrl,
        upsName,
      });
      return null;
    }
  }

  /**
   * UPS 상태 파싱
   * NUT 상태 코드를 내부 상태 타입으로 변환
   *
   * @param {string} status - NUT 상태 코드 문자열
   * @returns {InsightsData['ups']['status']} 파싱된 UPS 상태
   */
  private parseUPSStatus(
    status: string,
  ): NonNullable<InsightsData['ups']>['status'] {
    const statusUpper = status.toUpperCase();

    // NUT 상태 코드 파싱
    // OL = Online, OB = On Battery, LB = Low Battery, CHRG = Charging
    // 여러 상태가 공백으로 구분되어 있을 수 있음 (예: "OL CHRG")

    if (statusUpper.includes('OL') || statusUpper.includes('ONLINE')) {
      // CHRG가 포함되어 있으면 CHARGING, 아니면 ONLINE
      if (statusUpper.includes('CHRG') || statusUpper.includes('CHARGING')) {
        return 'CHARGING';
      }
      return 'ONLINE';
    }

    if (statusUpper.includes('OB') || statusUpper.includes('ONBATT')) {
      return 'ONBATT';
    }

    if (statusUpper.includes('LB') || statusUpper.includes('LOWBATT')) {
      return 'LOWBATT';
    }

    if (statusUpper.includes('CHRG') || statusUpper.includes('CHARGING')) {
      return 'CHARGING';
    }

    return 'UNKNOWN';
  }

  /**
   * 문자열을 숫자로 파싱
   * 파싱 실패 시 null 반환
   *
   * @param {string | undefined} value - 파싱할 문자열
   * @returns {number | null} 파싱된 숫자 또는 null
   */
  private parseNumber(value: string | undefined): number | null {
    if (!value) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * 환경 변수에서 설정값을 가져오는 공통 헬퍼 함수
   * ConfigService > process.env > 기본값 순서로 조회
   */
  private getConfigValue(
    key: string,
    defaultValue: string,
    errorMessage: string,
    action: string,
  ): string {
    const value =
      this.configService.get<string>(key) || process.env[key] || defaultValue;

    if (!value || value.trim() === '') {
      this.logger.error(errorMessage, {
        service: 'MonitoringService',
        action,
        key,
      });
      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return value.trim();
  }

  /**
   * Kuma URL 조회
   * 환경 변수에서 Kuma 서버 URL을 가져옴
   *
   * @returns {string} Kuma 서버 URL
   * @throws {HttpException} URL이 설정되지 않은 경우
   */
  private getKumaUrl(): string {
    return this.getConfigValue(
      'KUMA_URL',
      DEFAULT_KUMA_URL,
      ERROR_MESSAGES.KUMA.URL_NOT_SET,
      'getKumaUrl',
    );
  }

  /**
   * Kuma Status Page Slug 조회
   * 환경 변수에서 상태 페이지 슬러그를 가져옴
   *
   * @returns {string} 상태 페이지 슬러그
   * @throws {HttpException} 슬러그가 설정되지 않은 경우
   */
  private getStatusPageSlug(): string {
    return this.getConfigValue(
      'KUMA_STATUS_PAGE_SLUG',
      DEFAULT_KUMA_STATUS_PAGE_SLUG,
      ERROR_MESSAGES.KUMA.STATUS_PAGE_SLUG_NOT_SET,
      'getStatusPageSlug',
    );
  }

  /**
   * 에러 처리 및 변환
   * Axios 에러를 HttpException으로 변환하여 throw
   *
   * @param {unknown} error - 처리할 에러
   * @throws {HttpException} 변환된 HTTP 예외
   */
  private handleError(error: unknown): never {
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
