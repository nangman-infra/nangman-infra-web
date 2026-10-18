export type SecuritySource = 'ids' | 'firewall';
export type SecurityFilter = SecuritySource | 'all';
export type SecurityError = 'permission' | 'connection' | 'configuration';

export interface SecurityEvent {
  id: string;
  timestamp: number;
  source: SecuritySource;
  action: 'detected' | 'blocked';
  country: string;
  category: string;
  /** Broad category only; retained for clients that previously read rule text. */
  signature: string;
  protocol: string;
  port: number | null;
}

export interface SecuritySourceState {
  source: SecuritySource;
  lastSuccess: string | null;
  oldest: string | null;
  newest: string | null;
  received: number;
  matched: number;
  limit: number;
  stale: boolean;
  error: SecurityError | null;
}

export interface SecuritySnapshot {
  configured: boolean;
  generatedAt: string;
  refreshIntervalSeconds: number;
  filter: SecurityFilter;
  summary: {
    detections: number;
    ipsBlocked: number;
    firewallBlocked: number;
    countries: number;
  };
  countries: { code: string; count: number; blocked: number }[];
  categories: { name: string; count: number }[];
  ports: { port: number; protocol: string; count: number }[];
  events: (Omit<SecurityEvent, 'timestamp'> & { timestamp: string })[];
  sources: SecuritySourceState[];
  geoAvailable: boolean;
  engine: {
    status: 'running' | 'stopped' | null;
    enabledRulesets: number | null;
  };
}
