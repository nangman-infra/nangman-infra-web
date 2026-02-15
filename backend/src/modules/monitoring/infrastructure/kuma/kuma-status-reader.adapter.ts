import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { DEFAULT_TIMEOUT_MS } from '../../../../common/constants/monitoring';
import { ERROR_MESSAGES } from '../../../../common/constants/error-messages';
import { MonitoringOperationError } from '../../domain/errors/monitoring-operation.error';
import { KumaStatusReaderPort } from '../../domain/ports/kuma-status-reader.port';
import { KumaStatusSource } from '../../domain/models/kuma-source.model';
import {
  KumaApiHeartbeatResponse,
  KumaApiStatusPageResponse,
} from './types/kuma-api-response';

@Injectable()
export class KumaStatusReaderAdapter implements KumaStatusReaderPort {
  private readonly logger = new Logger(KumaStatusReaderAdapter.name);

  constructor(private readonly configService: ConfigService) {}

  async read(): Promise<KumaStatusSource> {
    const kumaUrl = this.getKumaUrl();
    const slug = this.getStatusPageSlug();

    try {
      const [statusPageResponse, heartbeatResponse] = await Promise.all([
        axios.get<KumaApiStatusPageResponse>(
          `${kumaUrl}/api/status-page/${slug}`,
          {
            timeout: DEFAULT_TIMEOUT_MS,
            headers: { Accept: 'application/json' },
          },
        ),
        axios.get<KumaApiHeartbeatResponse>(
          `${kumaUrl}/api/status-page/heartbeat/${slug}`,
          {
            timeout: DEFAULT_TIMEOUT_MS,
            headers: { Accept: 'application/json' },
          },
        ),
      ]);

      return {
        groups: statusPageResponse.data.publicGroupList.map((group) => ({
          monitors: group.monitorList.map((monitor) => ({
            id: monitor.id,
            name: monitor.name,
            type: monitor.type,
          })),
        })),
        heartbeatList: heartbeatResponse.data.heartbeatList,
        uptimeList: heartbeatResponse.data.uptimeList,
      };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  private getConfigValue(
    key: string,
    errorMessage: string,
    action: string,
  ): string {
    const value = this.configService.get<string>(key) || process.env[key];

    if (!value || value.trim() === '') {
      this.logger.error(errorMessage, {
        service: KumaStatusReaderAdapter.name,
        action,
        key,
      });
      throw new MonitoringOperationError(errorMessage, 500);
    }

    return value.trim();
  }

  private getKumaUrl(): string {
    return this.getConfigValue(
      'KUMA_URL',
      ERROR_MESSAGES.KUMA.URL_NOT_SET,
      'getKumaUrl',
    );
  }

  private getStatusPageSlug(): string {
    return this.getConfigValue(
      'KUMA_STATUS_PAGE_SLUG',
      ERROR_MESSAGES.KUMA.STATUS_PAGE_SLUG_NOT_SET,
      'getStatusPageSlug',
    );
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ETIMEDOUT'
      ) {
        this.logger.error('Kuma API 타임아웃', {
          service: KumaStatusReaderAdapter.name,
          action: 'read',
          error: axiosError.message,
          code: axiosError.code,
        });
        throw new MonitoringOperationError(
          ERROR_MESSAGES.KUMA.CONNECTION_TIMEOUT,
          504,
        );
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        const statusText = axiosError.response.statusText;

        this.logger.error('Kuma API 호출 실패', {
          service: KumaStatusReaderAdapter.name,
          action: 'read',
          status,
          statusText,
          data: axiosError.response.data,
        });

        if (status === 404) {
          throw new MonitoringOperationError(
            ERROR_MESSAGES.KUMA.STATUS_PAGE_NOT_FOUND,
            404,
            statusText,
          );
        }

        throw new MonitoringOperationError(
          ERROR_MESSAGES.KUMA.API_CALL_FAILED(statusText),
          status,
          statusText,
        );
      }

      if (axiosError.request) {
        this.logger.error('Kuma 서버에 연결할 수 없습니다', {
          service: KumaStatusReaderAdapter.name,
          action: 'read',
          error: axiosError.message,
        });
        throw new MonitoringOperationError(
          ERROR_MESSAGES.KUMA.CONNECTION_FAILED,
          503,
        );
      }
    }

    this.logger.error('알 수 없는 오류 발생', {
      service: KumaStatusReaderAdapter.name,
      action: 'read',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new MonitoringOperationError(ERROR_MESSAGES.KUMA.UNKNOWN_ERROR, 500);
  }
}
