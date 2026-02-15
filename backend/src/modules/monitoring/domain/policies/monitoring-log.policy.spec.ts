import { generateMonitoringLogs } from './monitoring-log.policy';
import { InsightsData, MonitorStatus } from '../models/monitoring.model';

describe('generateMonitoringLogs', () => {
  it('should generate alert/warn/info/probe logs and keep max display count', () => {
    const monitors: MonitorStatus[] = [
      {
        id: 1,
        name: 'offline-node-1',
        type: 'http',
        status: 'down',
        uptime: 0,
        lastCheck: null,
        group: 'Infrastructure Layer',
      },
      {
        id: 2,
        name: 'offline-node-2',
        type: 'http',
        status: 'down',
        uptime: 0,
        lastCheck: null,
        group: 'Infrastructure Layer',
      },
      {
        id: 3,
        name: 'up-node',
        type: 'http',
        status: 'up',
        uptime: 99.9,
        lastCheck: null,
        group: 'Applications',
      },
    ];

    const insights: InsightsData = {
      system: {
        load: [1, 1, 1],
        cpu: 95,
        memory: {
          used: 100,
          total: 200,
          percentage: 50,
        },
        ioWait: 0.02,
        stealTime: 0,
      },
      network: {
        dnsLatency: 12,
        gatewayLatency: 3.2,
        backbonePing: 20.1,
        sslStatus: 'SECURE',
        traffic: {
          inbound: 120,
          outbound: 10,
          inboundPps: 100,
          outboundPps: 80,
          activeConnections: 30,
          history: [],
        },
      },
    };

    const logs = generateMonitoringLogs(monitors, insights);

    expect(logs.length).toBeLessThanOrEqual(6);
    expect(logs.some((l) => l.level === 'ALERT')).toBe(true);
    expect(logs.some((l) => l.level === 'WARN')).toBe(true);
    expect(logs.some((l) => l.level === 'INFO')).toBe(true);
    expect(logs.some((l) => l.level === 'PROBE')).toBe(true);
  });
});
