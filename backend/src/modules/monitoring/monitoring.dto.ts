import {
  MonitoringSnapshot,
  MonitorStatus as DomainMonitorStatus,
  MonitoringSummary as DomainMonitoringSummary,
  MonitoringLog as DomainMonitoringLog,
  SystemInsights as DomainSystemInsights,
  NetworkInsights as DomainNetworkInsights,
  UpsInsights as DomainUpsInsights,
} from './domain/models/monitoring.model';

export type MonitorStatus = DomainMonitorStatus;
export type MonitoringSummary = DomainMonitoringSummary;
export type MonitoringLog = DomainMonitoringLog;
export type SystemInsights = DomainSystemInsights;
export type NetworkInsights = DomainNetworkInsights;
export type UpsInsights = DomainUpsInsights;

export interface MonitoringStatusResponse {
  success: boolean;
  data: MonitoringSnapshot;
}
