import { MonitoringSnapshot } from '../models/monitoring.model';

export const MONITORING_CACHE = Symbol('MONITORING_CACHE');

export interface MonitoringCachePort {
  get(key: string): Promise<MonitoringSnapshot | undefined>;
  set(key: string, value: MonitoringSnapshot, ttlMs: number): Promise<void>;
}
