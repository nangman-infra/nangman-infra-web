import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringStatusResponse } from './monitoring.dto';
import { MonitoringService } from './monitoring.service';
import { GetMonitoringStatusUseCase } from './application/use-cases/get-monitoring-status.use-case';

const mockGetMonitoringStatusUseCase = {
  execute: jest.fn(),
};

describe('MonitoringService', () => {
  let service: MonitoringService;
  let useCase: GetMonitoringStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: GetMonitoringStatusUseCase,
          useValue: mockGetMonitoringStatusUseCase,
        },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    useCase = module.get<GetMonitoringStatusUseCase>(
      GetMonitoringStatusUseCase,
    );
    jest.clearAllMocks();
  });

  it('should return wrapped status response from use case snapshot', async () => {
    const snapshot = {
      monitors: [],
      summary: {
        total: 0,
        online: 0,
        offline: 0,
        pending: 0,
      },
      insights: {
        system: {
          load: [0, 0, 0] as [number, number, number],
          cpu: 0,
          memory: {
            used: 0,
            total: 1,
            percentage: 0,
          },
          ioWait: 0,
          stealTime: 0,
        },
        network: {
          dnsLatency: 0,
          gatewayLatency: 0,
          backbonePing: 0,
          sslStatus: 'SECURE' as const,
          traffic: {
            inbound: 0,
            outbound: 0,
            inboundPps: 0,
            outboundPps: 0,
            activeConnections: 0,
            history: [],
          },
        },
        logs: [],
      },
    };

    const expected: MonitoringStatusResponse = {
      success: true,
      data: snapshot,
    };

    mockGetMonitoringStatusUseCase.execute.mockResolvedValue(snapshot);

    const result = await service.getMonitoringStatus();

    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });
});
