export interface KumaApiMonitor {
  id: number;
  name: string;
  type: string;
}

export interface KumaApiPublicGroup {
  monitorList: KumaApiMonitor[];
}

export interface KumaApiStatusPageResponse {
  publicGroupList: KumaApiPublicGroup[];
}

export interface KumaApiHeartbeat {
  status: 1 | 0;
  time: string;
}

export interface KumaApiHeartbeatResponse {
  heartbeatList: Record<string, KumaApiHeartbeat[]>;
  uptimeList: Record<string, number>;
}
