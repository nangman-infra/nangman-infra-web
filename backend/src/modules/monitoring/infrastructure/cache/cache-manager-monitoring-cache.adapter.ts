import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MonitoringSnapshot } from '../../domain/models/monitoring.model';
import { MonitoringCachePort } from '../../domain/ports/monitoring-cache.port';

@Injectable()
export class CacheManagerMonitoringCacheAdapter implements MonitoringCachePort {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get(key: string): Promise<MonitoringSnapshot | undefined> {
    return this.cacheManager.get<MonitoringSnapshot>(key);
  }

  async set(
    key: string,
    value: MonitoringSnapshot,
    ttlMs: number,
  ): Promise<void> {
    await this.cacheManager.set(key, value, ttlMs);
  }
}
