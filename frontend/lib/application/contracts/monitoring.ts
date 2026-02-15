import { MonitoringSnapshot } from '@/lib/domain/monitoring';

export interface MonitoringStatusResponse {
  success: boolean;
  data?: MonitoringSnapshot;
  message?: string;
}
