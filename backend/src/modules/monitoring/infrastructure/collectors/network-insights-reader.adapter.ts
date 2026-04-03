import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'node:dns';
import * as fs from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { NetworkInsightsReaderPort } from '../../domain/ports/network-insights-reader.port';
import { NetworkInsights } from '../../domain/models/monitoring.model';
import {
  BACKBONE_PING_TARGET,
  BITS_PER_BYTE,
  BYTES_TO_MBPS_DIVISOR,
  DECIMAL_PRECISION_DIVISOR,
  DECIMAL_PRECISION_MULTIPLIER,
  DNS_PROBE_HOSTNAME,
  GATEWAY_LATENCY_MULTIPLIER,
  MAX_TRAFFIC_HISTORY_LENGTH,
  MS_TO_SECONDS_DIVISOR,
  PERCENTAGE_MULTIPLIER,
} from '../../../../common/constants/monitoring';

const execAsync = promisify(exec);
const PING_TIME_PATTERN = /time=([\d.]+)\s*ms/;
const TRACKED_INTERFACE_PATTERN =
  /^(eth\d+|bond\d+|enp\d+s\d+|wlan\d+|br-\w+|docker\d+)$/;

interface InterfaceCounters {
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  time: number;
}

interface ParsedInterfaceStats {
  iface: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
}

interface TrafficTotals {
  inbound: number;
  outbound: number;
  inboundPps: number;
  outboundPps: number;
}

@Injectable()
export class NetworkInsightsReaderAdapter implements NetworkInsightsReaderPort {
  private readonly logger = new Logger(NetworkInsightsReaderAdapter.name);

  private prevNetStats: Record<string, InterfaceCounters> = {};

  private readonly trafficHistory: {
    timestamp: string;
    inbound: number;
    outbound: number;
  }[] = [];

  async read(): Promise<NetworkInsights> {
    const [traffic, probeStats] = await Promise.all([
      this.calculateNetworkTraffic(),
      this.runProbes(),
    ]);

    return {
      ...probeStats,
      traffic,
    };
  }

  private async runProbes(): Promise<Omit<NetworkInsights, 'traffic'>> {
    const startTime = Date.now();
    let dnsLatency = 0;
    try {
      await dns.promises.resolve(DNS_PROBE_HOSTNAME);
      dnsLatency = Date.now() - startTime;
    } catch (error: unknown) {
      this.logger.warn('DNS 조회 실패', {
        service: NetworkInsightsReaderAdapter.name,
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
      const match = PING_TIME_PATTERN.exec(stdout);
      backbonePing = match ? Number.parseFloat(match[1]) : 0;
    } catch (error: unknown) {
      this.logger.warn('백본 핑 실패', {
        service: NetworkInsightsReaderAdapter.name,
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

  private async calculateNetworkTraffic(): Promise<NetworkInsights['traffic']> {
    let inbound = 0;
    let outbound = 0;
    let inboundPps = 0;
    let outboundPps = 0;
    let activeConnections = 0;

    try {
      const { netDevPath, tcpPath } = this.resolveProcPaths();

      if (fs.existsSync(netDevPath)) {
        const netDev = fs.readFileSync(netDevPath, 'utf8');
        const now = Date.now();
        const trafficTotals = this.collectTrafficTotals(netDev, now);
        inbound = trafficTotals.inbound;
        outbound = trafficTotals.outbound;
        inboundPps = trafficTotals.inboundPps;
        outboundPps = trafficTotals.outboundPps;

        try {
          if (fs.existsSync(tcpPath)) {
            const tcpStats = fs.readFileSync(tcpPath, 'utf8');
            activeConnections = tcpStats
              .split('\n')
              .filter((line) => line.includes(' 01 ')).length;
          }
        } catch (error: unknown) {
          this.logger.debug('TCP 연결 수 계산 실패', {
            service: NetworkInsightsReaderAdapter.name,
            action: 'calculateNetworkTraffic',
            error: error instanceof Error ? error.message : String(error),
          });
          activeConnections = 0;
        }
      }
    } catch (error: unknown) {
      this.logger.warn('Failed to read network stats', {
        service: NetworkInsightsReaderAdapter.name,
        action: 'calculateNetworkTraffic',
        error: error instanceof Error ? error.message : String(error),
      });
    }

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

  private roundToDecimalPlaces(value: number, multiplier: number): number {
    return Math.round(value * multiplier) / multiplier;
  }

  private resolveProcPaths(): { netDevPath: string; tcpPath: string } {
    return {
      netDevPath: fs.existsSync('/host/proc/net/dev')
        ? '/host/proc/net/dev'
        : '/proc/net/dev',
      tcpPath: fs.existsSync('/host/proc/net/tcp')
        ? '/host/proc/net/tcp'
        : '/proc/net/tcp',
    };
  }

  private collectTrafficTotals(netDev: string, now: number): TrafficTotals {
    const totals: TrafficTotals = {
      inbound: 0,
      outbound: 0,
      inboundPps: 0,
      outboundPps: 0,
    };

    for (const line of netDev.split('\n')) {
      const stats = this.parseInterfaceStats(line);
      if (!stats) {
        continue;
      }

      this.accumulateTrafficTotals(totals, stats, now);
    }

    return totals;
  }

  private parseInterfaceStats(line: string): ParsedInterfaceStats | null {
    const [rawInterfaceName, rawCounters] = line.split(':');
    if (!rawInterfaceName || !rawCounters) {
      return null;
    }

    const iface = rawInterfaceName.trim();
    if (!TRACKED_INTERFACE_PATTERN.test(iface)) {
      return null;
    }

    const counters = rawCounters.trim().split(/\s+/);
    if (counters.length < 10) {
      return null;
    }

    return {
      iface,
      rxBytes: Number.parseInt(counters[0], 10),
      rxPackets: Number.parseInt(counters[1], 10),
      txBytes: Number.parseInt(counters[8], 10),
      txPackets: Number.parseInt(counters[9], 10),
    };
  }

  private accumulateTrafficTotals(
    totals: TrafficTotals,
    stats: ParsedInterfaceStats,
    now: number,
  ): void {
    const previousStats = this.prevNetStats[stats.iface];
    if (previousStats) {
      const timeDiff = (now - previousStats.time) / MS_TO_SECONDS_DIVISOR;
      if (timeDiff > 0) {
        totals.inbound +=
          ((stats.rxBytes - previousStats.rxBytes) * BITS_PER_BYTE) /
          BYTES_TO_MBPS_DIVISOR /
          timeDiff;
        totals.outbound +=
          ((stats.txBytes - previousStats.txBytes) * BITS_PER_BYTE) /
          BYTES_TO_MBPS_DIVISOR /
          timeDiff;
        totals.inboundPps +=
          (stats.rxPackets - previousStats.rxPackets) / timeDiff;
        totals.outboundPps +=
          (stats.txPackets - previousStats.txPackets) / timeDiff;
      }
    }

    this.prevNetStats[stats.iface] = {
      rxBytes: stats.rxBytes,
      txBytes: stats.txBytes,
      rxPackets: stats.rxPackets,
      txPackets: stats.txPackets,
      time: now,
    };
  }
}
