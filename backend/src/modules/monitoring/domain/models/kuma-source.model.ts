export interface KumaSourceMonitor {
  id: number;
  name: string;
  type: string;
}

export interface KumaSourceGroup {
  monitors: KumaSourceMonitor[];
}

export interface KumaSourceHeartbeat {
  status: 1 | 0;
  time: string;
}

export interface KumaStatusSource {
  groups: KumaSourceGroup[];
  heartbeatList: Record<string, KumaSourceHeartbeat[]>;
  uptimeList: Record<string, number>;
}
