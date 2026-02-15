import {
  InsightsData,
  MonitoringLog,
  MonitorStatus,
} from '../models/monitoring.model';
import {
  CPU_HIGH_THRESHOLD_PERCENT,
  MAX_LOG_DISPLAY_COUNT,
  NETWORK_TRAFFIC_HIGH_THRESHOLD_MBPS,
} from '../../../../common/constants/monitoring';

export function generateMonitoringLogs(
  monitors: MonitorStatus[],
  insights: InsightsData,
  now: Date = new Date(),
): MonitoringLog[] {
  const logs: MonitoringLog[] = [];

  // 1. 시스템 상태 로그
  if (insights.system.cpu > CPU_HIGH_THRESHOLD_PERCENT) {
    logs.push({
      timestamp: now.toISOString(),
      level: 'WARN',
      source: 'SYSTEM',
      message: `High CPU load detected: ${insights.system.cpu}%`,
    });
  }

  // 2. 모니터 상태 로그
  const offlineNodes = monitors.filter((m) => m.status === 'down');
  if (offlineNodes.length > 0) {
    offlineNodes.forEach((node) => {
      logs.push({
        timestamp: now.toISOString(),
        level: 'ALERT',
        source: 'MONITOR',
        message: `Node "${node.name}" is currently OFFLINE`,
      });
    });
  }

  // 3. 네트워크 상태 로그
  if (insights.network.traffic.inbound > NETWORK_TRAFFIC_HIGH_THRESHOLD_MBPS) {
    logs.push({
      timestamp: now.toISOString(),
      level: 'WARN',
      source: 'NETWORK',
      message: `High inbound traffic detected: ${insights.network.traffic.inbound} Mbps`,
    });
  }

  // 4. 기본 정보 로그 (항상 표시되는 로그들)
  logs.push({
    timestamp: now.toISOString(),
    level: 'INFO',
    source: 'SYSTEM',
    message: `Cluster Load Balanced (${monitors.length} Nodes Active)`,
  });

  logs.push({
    timestamp: now.toISOString(),
    level: 'PROBE',
    source: 'NETWORK',
    message: `Gateway Latency: ${insights.network.gatewayLatency}ms / DNS: ${insights.network.dnsLatency}ms`,
  });

  // 시간 역순 정렬 후 최대 개수만 유지
  return logs
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, MAX_LOG_DISPLAY_COUNT);
}
