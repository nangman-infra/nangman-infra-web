import { NetworkInsights } from '../models/monitoring.model';

export const NETWORK_INSIGHTS_READER = Symbol('NETWORK_INSIGHTS_READER');

export interface NetworkInsightsReaderPort {
  read(): Promise<NetworkInsights>;
}
