import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ERROR_MESSAGES } from '../../../../common/constants/error-messages';
import { MonitoringOperationError } from '../../domain/errors/monitoring-operation.error';
import { KumaStatusReaderAdapter } from './kuma-status-reader.adapter';

jest.mock('axios');

describe('KumaStatusReaderAdapter', () => {
  const mockConfigService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let adapter: KumaStatusReaderAdapter;

  beforeEach(() => {
    adapter = new KumaStatusReaderAdapter(mockConfigService);
    jest.clearAllMocks();
  });

  it('should map kuma api payload to domain source snapshot', async () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'KUMA_URL') {
        return 'http://kuma.local';
      }
      if (key === 'KUMA_STATUS_PAGE_SLUG') {
        return 'nangman';
      }
      return undefined;
    });

    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          publicGroupList: [
            {
              monitorList: [
                {
                  id: 1,
                  name: 'nangman.cloud',
                  type: 'http',
                },
              ],
            },
          ],
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          heartbeatList: {
            '1': [{ status: 1, time: '2026-02-15T00:00:00.000Z' }],
          },
          uptimeList: { '1_24': 99.99 },
        },
      } as never);

    const result = await adapter.read();

    expect(result).toEqual({
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
      uptimeList: { '1_24': 99.99 },
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('should map timeout axios error to gateway timeout exception', async () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'KUMA_URL') {
        return 'http://kuma.local';
      }
      if (key === 'KUMA_STATUS_PAGE_SLUG') {
        return 'nangman';
      }
      return undefined;
    });

    const timeoutError = {
      isAxiosError: true,
      code: 'ECONNABORTED',
      message: 'timeout',
    };

    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockRejectedValue(timeoutError as never);
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(adapter.read()).rejects.toBeInstanceOf(
      MonitoringOperationError,
    );

    try {
      await adapter.read();
    } catch (error: unknown) {
      const exception = error as MonitoringOperationError;
      expect(exception.statusCode).toBe(504);
      expect(exception.message).toBe(ERROR_MESSAGES.KUMA.CONNECTION_TIMEOUT);
    }
  });
});
