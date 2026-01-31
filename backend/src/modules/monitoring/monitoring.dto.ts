export interface KumaMonitor {
  id: number;
  name: string;
  type: 'http' | 'ping' | 'port' | 'keyword' | 'grpc' | 'docker' | 'push';
  sendUrl?: number;
}

export interface KumaPublicGroup {
  id: number;
  name: string;
  weight: number;
  monitorList: KumaMonitor[];
}

export interface KumaIncident {
  id: number;
  title: string;
  content: string;
  style: string;
  pin: boolean;
  createdDate: string;
}

export interface KumaMaintenance {
  id: number;
  title: string;
  description: string;
  style: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface KumaStatusPageResponse {
  config: {
    slug: string;
    title: string;
    description: string;
    icon: string;
    autoRefreshInterval: number;
    theme: string;
    published: boolean;
    showTags: boolean;
    customCSS: string;
    footerText: string | null;
    showPoweredBy: boolean;
    googleAnalyticsId: string | null;
    showCertificateExpiry: boolean;
  };
  incident: KumaIncident | null;
  publicGroupList: KumaPublicGroup[];
  maintenanceList: KumaMaintenance[];
}

export interface KumaHeartbeat {
  status: 1 | 0; // 1 = up, 0 = down
  time: string;
  msg: string;
  ping: number | null;
}

export interface KumaHeartbeatResponse {
  heartbeatList: {
    [monitorId: string]: KumaHeartbeat[];
  };
  uptimeList: {
    [monitorId_24: string]: number; // 예: "24_24": 0.9888888888888889 (98.89%)
  };
}

export interface MonitorStatus {
  id: number;
  name: string;
  type: string;
  status: 'up' | 'down' | 'pending' | 'unknown';
  uptime: number | null;
  lastCheck: string | null;
  group: string;
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

export interface InsightsData {
  system: SystemInsights;
  network: NetworkInsights;
  ups?: {
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
  };
}

export interface MonitoringStatusResponse {
  success: boolean;
  data: {
    monitors: MonitorStatus[];
    summary: {
      total: number;
      online: number;
      offline: number;
      pending: number;
    };
    insights: {
      system: {
        load: [number, number, number];
        cpu: number;
        memory: {
          used: number;
          total: number;
          percentage: number;
        };
        ioWait: number;
        stealTime: number;
      };
      network: {
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
      };
      logs: MonitoringLog[];
      ups?: {
        status: 'ONLINE' | 'ONBATT' | 'LOWBATT' | 'CHARGING' | 'UNKNOWN';
        batteryCharge: number | null; // 배터리 충전률 (%)
        batteryVoltage: number | null; // 배터리 전압 (V)
        batteryVoltageNominal: number | null; // 배터리 전압 정격 (V)
        inputVoltage: number | null; // 입력 전압 (V)
        inputVoltageNominal: number | null; // 입력 전압 정격 (V)
        outputVoltage: number | null; // 출력 전압 (V)
        load: number | null; // 부하율 (%)
        realpowerNominal: number | null; // 정격 전력 (W)
        currentPower: number | null; // 현재 소비전력 (W) = (load / 100) * realpowerNominal
        temperature: number | null; // 온도 (°C)
        runtimeRemaining: number | null; // 남은 런타임 (초)
        lastUpdate: string | null; // 마지막 업데이트 시간
      };
    };
  };
}
