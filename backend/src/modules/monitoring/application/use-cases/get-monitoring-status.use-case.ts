import { Inject, Injectable, Logger } from '@nestjs/common';
import { MONITORING_CACHE_TTL_MS } from '../../../../common/constants/monitoring';
import {
  KumaSourceHeartbeat,
  KumaSourceMonitor,
  KumaStatusSource,
} from '../../domain/models/kuma-source.model';
import {
  InsightsData,
  MonitoringSnapshot,
  MonitorStatus,
} from '../../domain/models/monitoring.model';
import {
  KUMA_STATUS_READER,
  KumaStatusReaderPort,
} from '../../domain/ports/kuma-status-reader.port';
import {
  MONITORING_CACHE,
  MonitoringCachePort,
} from '../../domain/ports/monitoring-cache.port';
import {
  NETWORK_INSIGHTS_READER,
  NetworkInsightsReaderPort,
} from '../../domain/ports/network-insights-reader.port';
import {
  SYSTEM_INSIGHTS_READER,
  SystemInsightsReaderPort,
} from '../../domain/ports/system-insights-reader.port';
import {
  UPS_STATUS_READER,
  UpsStatusReaderPort,
} from '../../domain/ports/ups-status-reader.port';
import { determineMonitorGroup as determineMonitorGroupByPolicy } from '../../domain/policies/monitor-group.policy';
import { generateMonitoringLogs } from '../../domain/policies/monitoring-log.policy';
import { calculateMonitoringSummary } from '../../domain/policies/monitoring-summary.policy';

@Injectable()
export class GetMonitoringStatusUseCase {
  private readonly logger = new Logger(GetMonitoringStatusUseCase.name);
  private readonly cacheKey = 'monitoring_status';

  constructor(
    @Inject(KUMA_STATUS_READER)
    private readonly kumaStatusReader: KumaStatusReaderPort,
    @Inject(SYSTEM_INSIGHTS_READER)
    private readonly systemInsightsReader: SystemInsightsReaderPort,
    @Inject(NETWORK_INSIGHTS_READER)
    private readonly networkInsightsReader: NetworkInsightsReaderPort,
    @Inject(UPS_STATUS_READER)
    private readonly upsStatusReader: UpsStatusReaderPort,
    @Inject(MONITORING_CACHE)
    private readonly monitoringCache: MonitoringCachePort,
  ) {}

  async execute(): Promise<MonitoringSnapshot> {
    const cached = await this.monitoringCache.get(this.cacheKey);
    if (cached) {
      this.logger.debug('Returning cached monitoring status');
      return cached;
    }

    const [kumaSnapshot, insights] = await Promise.all([
      this.kumaStatusReader.read(),
      this.collectInsights(),
    ]);

    const monitors = this.transformKumaDataToMonitors(kumaSnapshot);
    const summary = calculateMonitoringSummary(monitors);
    const logs = generateMonitoringLogs(monitors, insights);

    const snapshot: MonitoringSnapshot = {
      monitors,
      summary,
      insights: {
        ...insights,
        logs,
      },
    };

    await this.monitoringCache.set(
      this.cacheKey,
      snapshot,
      MONITORING_CACHE_TTL_MS,
    );

    return snapshot;
  }

  private async collectInsights(): Promise<InsightsData> {
    const [system, network, ups] = await Promise.all([
      this.systemInsightsReader.read(),
      this.networkInsightsReader.read(),
      this.upsStatusReader.read().catch((error: unknown) => {
        this.logger.debug('UPS 상태 수집 실패 (무시됨)', {
          service: GetMonitoringStatusUseCase.name,
          action: 'collectInsights',
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }),
    ]);

    return {
      system,
      network,
      ...(ups && { ups }),
    };
  }

  private transformKumaDataToMonitors(
    kumaData: KumaStatusSource,
  ): MonitorStatus[] {
    const monitors: MonitorStatus[] = [];

    for (const group of kumaData.groups) {
      for (const monitor of group.monitors) {
        const monitorStatus = this.transformKumaMonitorToStatus(
          monitor,
          kumaData.heartbeatList,
          kumaData.uptimeList,
        );
        monitors.push(monitorStatus);
      }
    }

    return monitors;
  }

  private transformKumaMonitorToStatus(
    monitor: KumaSourceMonitor,
    heartbeatListByMonitor: Record<string, KumaSourceHeartbeat[]>,
    uptimeListByWindow: Record<string, number>,
  ): MonitorStatus {
    const monitorId = monitor.id.toString();
    const heartbeatList = heartbeatListByMonitor[monitorId] || [];
    const latestHeartbeat = heartbeatList[heartbeatList.length - 1];

    const status = this.determineMonitorStatus(latestHeartbeat);
    const uptime = this.calculateUptime(monitorId, uptimeListByWindow);
    const lastCheck = latestHeartbeat?.time || null;
    const monitorName = monitor.name.trim();
    const group = determineMonitorGroupByPolicy(monitorName);

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

  private determineMonitorStatus(
    latestHeartbeat: KumaSourceHeartbeat | undefined,
  ): MonitorStatus['status'] {
    if (!latestHeartbeat) {
      return 'unknown';
    }
    return latestHeartbeat.status === 1 ? 'up' : 'down';
  }

  private calculateUptime(
    monitorId: string,
    uptimeListByWindow: Record<string, number>,
  ): number | null {
    const uptimeKey = `${monitorId}_24`;
    const uptimeValue = uptimeListByWindow[uptimeKey];
    if (uptimeValue === undefined) {
      return null;
    }

    return Math.round(uptimeValue * 10_000) / 100;
  }
}
