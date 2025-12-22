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
  incident: any;
  publicGroupList: KumaPublicGroup[];
  maintenanceList: any[];
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
          inbound: number; // Mbps
          outbound: number; // Mbps
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
      logs: {
        timestamp: string;
        level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT' | 'PROBE';
        source: string;
        message: string;
      }[];
    };
  };
}
