import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
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

@Injectable()
export class NetworkInsightsReaderAdapter implements NetworkInsightsReaderPort {
  private readonly logger = new Logger(NetworkInsightsReaderAdapter.name);

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
      const match = stdout.match(/time=([\d.]+)\s*ms/);
      backbonePing = match ? parseFloat(match[1]) : 0;
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
                  timeDiff;
                outbound +=
                  ((txBytes - prev.txBytes) * BITS_PER_BYTE) /
                  BYTES_TO_MBPS_DIVISOR /
                  timeDiff;
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
}
