import {
  sendContactMessageUseCase,
} from '@/lib/application/use-cases/contact/send-contact-message';
import {
  getMonitoringStatusUseCase,
} from '@/lib/application/use-cases/monitoring/get-monitoring-status';
import type { MonitoringStatusResponse } from '@/lib/application/contracts/monitoring';

export type { ContactFormData, ContactResponse } from '@/lib/domain/contact';
export type {
  MonitorStatus,
  MonitoringSummary,
  MonitoringLog,
  SystemInsights,
  NetworkInsights,
  UpsInsights,
  MonitoringInsights,
} from '@/lib/domain/monitoring';
export type { MonitoringStatusResponse };

export const sendContactMessage = sendContactMessageUseCase;
export const getMonitoringStatus = getMonitoringStatusUseCase;
