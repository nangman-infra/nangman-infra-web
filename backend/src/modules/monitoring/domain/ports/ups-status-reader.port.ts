import { UpsInsights } from '../models/monitoring.model';

export const UPS_STATUS_READER = Symbol('UPS_STATUS_READER');

export interface UpsStatusReaderPort {
  read(): Promise<UpsInsights | null>;
}
