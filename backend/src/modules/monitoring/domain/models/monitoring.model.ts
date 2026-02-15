export interface MonitorStatus {
  id: number;
  name: string;
  type: string;
  status: 'up' | 'down' | 'pending' | 'unknown';
  uptime: number | null;
  lastCheck: string | null;
  group: string;
}

export interface MonitoringSummary {
  total: number;
  online: number;
  offline: number;
  pending: number;
}

export interface MonitoringLog {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT' | 'PROBE';
  source: string;
  message: string;
}

export interface SystemInsights {
  load: [number, number, number];
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  ioWait: number;
  stealTime: number;
}

export interface NetworkInsights {
  dnsLatency: number;
  gatewayLatency: number;
  backbonePing: number;
  sslStatus: 'SECURE' | 'WARNING' | 'EXPIRED';
  traffic: {
    inbound: number;
    outbound: number;
    inboundPps: number;
    outboundPps: number;
    activeConnections: number;
    history: {
      timestamp: string;
      inbound: number;
      outbound: number;
    }[];
  };
}

export interface UpsInsights {
  status: 'ONLINE' | 'ONBATT' | 'LOWBATT' | 'CHARGING' | 'UNKNOWN';
  batteryCharge: number | null;
  batteryVoltage: number | null;
  batteryVoltageNominal: number | null;
  inputVoltage: number | null;
  inputVoltageNominal: number | null;
  outputVoltage: number | null;
  load: number | null;
  realpowerNominal: number | null;
  currentPower: number | null;
  temperature: number | null;
  runtimeRemaining: number | null;
  lastUpdate: string | null;
}

export interface MonitoringInsights {
  system: SystemInsights;
  network: NetworkInsights;
  logs: MonitoringLog[];
  ups?: UpsInsights;
}

export interface InsightsData {
  system: SystemInsights;
  network: NetworkInsights;
  ups?: UpsInsights;
}

export interface MonitoringSnapshot {
  monitors: MonitorStatus[];
  summary: MonitoringSummary;
  insights: MonitoringInsights;
}
