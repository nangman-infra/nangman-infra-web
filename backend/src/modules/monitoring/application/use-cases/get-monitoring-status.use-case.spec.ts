import { MonitoringSnapshot } from '../../domain/models/monitoring.model';
import { MonitoringCachePort } from '../../domain/ports/monitoring-cache.port';
import { KumaStatusReaderPort } from '../../domain/ports/kuma-status-reader.port';
import { NetworkInsightsReaderPort } from '../../domain/ports/network-insights-reader.port';
import { SystemInsightsReaderPort } from '../../domain/ports/system-insights-reader.port';
import { UpsStatusReaderPort } from '../../domain/ports/ups-status-reader.port';
import { GetMonitoringStatusUseCase } from './get-monitoring-status.use-case';

describe('GetMonitoringStatusUseCase', () => {
  const mockKumaReader: jest.Mocked<KumaStatusReaderPort> = {
    read: jest.fn(),
  };

  const mockSystemReader: jest.Mocked<SystemInsightsReaderPort> = {
    read: jest.fn(),
  };

  const mockNetworkReader: jest.Mocked<NetworkInsightsReaderPort> = {
    read: jest.fn(),
  };

  const mockUpsReader: jest.Mocked<UpsStatusReaderPort> = {
    read: jest.fn(),
  };

  const mockMonitoringCache: jest.Mocked<MonitoringCachePort> = {
    get: jest.fn(),
    set: jest.fn(),
  };

  let useCase: GetMonitoringStatusUseCase;

  beforeEach(() => {
    useCase = new GetMonitoringStatusUseCase(
      mockKumaReader,
      mockSystemReader,
      mockNetworkReader,
      mockUpsReader,
      mockMonitoringCache,
    );
    jest.clearAllMocks();
  });

  it('should aggregate monitoring status from ports', async () => {
    mockMonitoringCache.get.mockResolvedValue(undefined);
    mockKumaReader.read.mockResolvedValue({
      groups: [
        {
          monitors: [
            {
              id: 1,
              name: 'nangman.cloud',
              type: 'http',
            },
          ],
        },
      ],
      heartbeatList: {
        '1': [{ status: 1, time: '2026-02-15T00:00:00.000Z' }],
      },
      uptimeList: {
        '1_24': 99.99,
      },
    });

    mockSystemReader.read.mockResolvedValue({
      load: [0.1, 0.2, 0.3],
      cpu: 10,
      memory: {
        used: 10,
        total: 20,
        percentage: 50,
      },
      ioWait: 0.02,
      stealTime: 0,
    });

    mockNetworkReader.read.mockResolvedValue({
      dnsLatency: 10,
      gatewayLatency: 2,
      backbonePing: 15,
      sslStatus: 'SECURE',
      traffic: {
        inbound: 1,
        outbound: 1,
        inboundPps: 10,
        outboundPps: 10,
        activeConnections: 3,
        history: [],
      },
    });

    mockUpsReader.read.mockResolvedValue({
      status: 'ONLINE',
      batteryCharge: 100,
      batteryVoltage: 12,
      batteryVoltageNominal: 12,
      inputVoltage: 220,
      inputVoltageNominal: 220,
      outputVoltage: 220,
      load: 10,
      realpowerNominal: 1000,
      currentPower: 100,
      temperature: 30,
      runtimeRemaining: 1200,
      lastUpdate: '2026-02-15T00:00:00.000Z',
    });

    const result = await useCase.execute();

    expect(result.monitors).toHaveLength(1);
    expect(result.summary).toEqual({
      total: 1,
      online: 1,
      offline: 0,
      pending: 0,
    });
    expect(result.insights.ups?.status).toBe('ONLINE');
    expect(mockMonitoringCache.set).toHaveBeenCalledTimes(1);
  });

  it('should ignore ups collection failure and keep response success', async () => {
    mockMonitoringCache.get.mockResolvedValue(undefined);
    mockKumaReader.read.mockResolvedValue({
      groups: [],
      heartbeatList: {},
      uptimeList: {},
    });

    mockSystemReader.read.mockResolvedValue({
      load: [0, 0, 0],
      cpu: 0,
      memory: {
        used: 0,
        total: 1,
        percentage: 0,
      },
      ioWait: 0.02,
      stealTime: 0,
    });

    mockNetworkReader.read.mockResolvedValue({
      dnsLatency: 0,
      gatewayLatency: 0,
      backbonePing: 0,
      sslStatus: 'SECURE',
      traffic: {
        inbound: 0,
        outbound: 0,
        inboundPps: 0,
        outboundPps: 0,
        activeConnections: 0,
        history: [],
      },
    });

    mockUpsReader.read.mockRejectedValue(new Error('ups failed'));

    const result = await useCase.execute();

    expect(result.insights.ups).toBeUndefined();
    expect(result.summary.total).toBe(0);
  });

  it('should return cached response when cache exists', async () => {
    const cachedSnapshot: MonitoringSnapshot = {
      monitors: [],
      summary: {
        total: 0,
        online: 0,
        offline: 0,
        pending: 0,
      },
      insights: {
        system: {
          load: [0, 0, 0],
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
          sslStatus: 'SECURE',
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
    mockMonitoringCache.get.mockResolvedValue(cachedSnapshot);

    const result = await useCase.execute();

    expect(result).toEqual(cachedSnapshot);
    expect(mockKumaReader.read).not.toHaveBeenCalled();
    expect(mockSystemReader.read).not.toHaveBeenCalled();
    expect(mockNetworkReader.read).not.toHaveBeenCalled();
    expect(mockUpsReader.read).not.toHaveBeenCalled();
    expect(mockMonitoringCache.set).not.toHaveBeenCalled();
  });
});
