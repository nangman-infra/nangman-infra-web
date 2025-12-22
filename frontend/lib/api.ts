const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
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

export interface MonitoringSummary {
  total: number;
  online: number;
  offline: number;
  pending: number;
}

export interface MonitoringStatusResponse {
  success: boolean;
  data?: {
    monitors: MonitorStatus[];
    summary: MonitoringSummary;
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
      logs: {
        timestamp: string;
        level: 'INFO' | 'SUCCESS' | 'WARN' | 'ALERT' | 'PROBE';
        source: string;
        message: string;
      }[];
    };
  };
  message?: string;
}

export async function sendContactMessage(
  data: ContactFormData,
): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: '메시지 전송에 실패했습니다.',
    }));
    throw new Error(error.message || '메시지 전송에 실패했습니다.');
  }

  return response.json();
}

export async function getMonitoringStatus(): Promise<MonitoringStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/monitoring/status`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: '모니터링 상태를 가져오는데 실패했습니다.',
    }));
    throw new Error(error.message || '모니터링 상태를 가져오는데 실패했습니다.');
  }

  return response.json();
}

