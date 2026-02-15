import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { MonitoringStatusResponse } from './monitoring.dto';

describe('MonitoringController', () => {
  const mockMonitoringService = {
    getMonitoringStatus: jest.fn(),
  };

  let controller: MonitoringController;
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: MonitoringService,
          useValue: mockMonitoringService,
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    service = module.get<MonitoringService>(MonitoringService);
    jest.clearAllMocks();
  });

  it('should return monitoring status response from service', async () => {
    const expected: MonitoringStatusResponse = {
      success: true,
      data: {
        monitors: [
          {
            id: 1,
            name: 'nangman.cloud',
            type: 'http',
            status: 'up',
            uptime: 99.9,
            lastCheck: '2026-02-15T14:00:00.000Z',
            group: 'Applications',
          },
        ],
        summary: {
          total: 1,
          online: 1,
          offline: 0,
          pending: 0,
        },
        insights: {
          system: {
            load: [0.1, 0.2, 0.3],
            cpu: 12.3,
            memory: {
              used: 1024,
              total: 2048,
              percentage: 50,
            },
            ioWait: 0.02,
            stealTime: 0,
          },
          network: {
            dnsLatency: 8,
            gatewayLatency: 2.1,
            backbonePing: 14.5,
            sslStatus: 'SECURE',
            traffic: {
              inbound: 10.1,
              outbound: 5.2,
              inboundPps: 1000,
              outboundPps: 900,
              activeConnections: 42,
              history: [
                {
                  timestamp: '10:00:00',
                  inbound: 10.1,
                  outbound: 5.2,
                },
              ],
            },
          },
          logs: [
            {
              timestamp: '2026-02-15T14:00:00.000Z',
              level: 'INFO',
              source: 'SYSTEM',
              message: 'Cluster Load Balanced (1 Nodes Active)',
            },
          ],
        },
      },
    };

    mockMonitoringService.getMonitoringStatus.mockResolvedValue(expected);

    const result = await controller.getStatus();

    expect(service.getMonitoringStatus).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });
});
