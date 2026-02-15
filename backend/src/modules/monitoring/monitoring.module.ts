import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MONITORING_CACHE_TTL_MS } from '../../common/constants/monitoring';
import { GetMonitoringStatusUseCase } from './application/use-cases/get-monitoring-status.use-case';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { MONITORING_CACHE } from './domain/ports/monitoring-cache.port';
import { KUMA_STATUS_READER } from './domain/ports/kuma-status-reader.port';
import { NETWORK_INSIGHTS_READER } from './domain/ports/network-insights-reader.port';
import { SYSTEM_INSIGHTS_READER } from './domain/ports/system-insights-reader.port';
import { UPS_STATUS_READER } from './domain/ports/ups-status-reader.port';
import { CacheManagerMonitoringCacheAdapter } from './infrastructure/cache/cache-manager-monitoring-cache.adapter';
import { NetworkInsightsReaderAdapter } from './infrastructure/collectors/network-insights-reader.adapter';
import { SystemInsightsReaderAdapter } from './infrastructure/collectors/system-insights-reader.adapter';
import { UpsStatusReaderAdapter } from './infrastructure/collectors/ups-status-reader.adapter';
import { KumaStatusReaderAdapter } from './infrastructure/kuma/kuma-status-reader.adapter';

@Module({
  imports: [
    CacheModule.register({
      ttl: MONITORING_CACHE_TTL_MS,
      max: 100,
    }),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    GetMonitoringStatusUseCase,
    CacheManagerMonitoringCacheAdapter,
    KumaStatusReaderAdapter,
    SystemInsightsReaderAdapter,
    NetworkInsightsReaderAdapter,
    UpsStatusReaderAdapter,
    {
      provide: KUMA_STATUS_READER,
      useExisting: KumaStatusReaderAdapter,
    },
    {
      provide: MONITORING_CACHE,
      useExisting: CacheManagerMonitoringCacheAdapter,
    },
    {
      provide: SYSTEM_INSIGHTS_READER,
      useExisting: SystemInsightsReaderAdapter,
    },
    {
      provide: NETWORK_INSIGHTS_READER,
      useExisting: NetworkInsightsReaderAdapter,
    },
    {
      provide: UPS_STATUS_READER,
      useExisting: UpsStatusReaderAdapter,
    },
  ],
})
export class MonitoringModule {}
