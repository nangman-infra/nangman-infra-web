import { SystemInsights } from '../models/monitoring.model';

export const SYSTEM_INSIGHTS_READER = Symbol('SYSTEM_INSIGHTS_READER');

export interface SystemInsightsReaderPort {
  read(): Promise<SystemInsights>;
}
