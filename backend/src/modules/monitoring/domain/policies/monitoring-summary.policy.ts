import { MonitorStatus, MonitoringSummary } from '../models/monitoring.model';

export function calculateMonitoringSummary(
  monitors: MonitorStatus[],
): MonitoringSummary {
  const total = monitors.length;
  const online = monitors.filter((m) => m.status === 'up').length;
  const offline = monitors.filter((m) => m.status === 'down').length;
  const pending = monitors.filter((m) => m.status === 'pending').length;

  return {
    total,
    online,
    offline,
    pending,
  };
}
