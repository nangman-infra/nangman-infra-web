import { calculateMonitoringSummary } from './monitoring-summary.policy';
import { MonitorStatus } from '../models/monitoring.model';

describe('calculateMonitoringSummary', () => {
  it('should calculate total/online/offline/pending summary', () => {
    const monitors: MonitorStatus[] = [
      {
        id: 1,
        name: 'A',
        type: 'http',
        status: 'up',
        uptime: 100,
        lastCheck: null,
        group: 'Applications',
      },
      {
        id: 2,
        name: 'B',
        type: 'http',
        status: 'down',
        uptime: 0,
        lastCheck: null,
        group: 'Infrastructure Layer',
      },
      {
        id: 3,
        name: 'C',
        type: 'http',
        status: 'pending',
        uptime: null,
        lastCheck: null,
        group: 'Platform Services',
      },
    ];

    expect(calculateMonitoringSummary(monitors)).toEqual({
      total: 3,
      online: 1,
      offline: 1,
      pending: 1,
    });
  });
});
