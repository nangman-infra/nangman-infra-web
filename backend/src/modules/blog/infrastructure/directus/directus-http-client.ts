import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

interface DirectusAuthLoginResponse {
  data?: {
    access_token?: string;
  };
}

type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
}

@Injectable()
export class DirectusHttpClient {
  private readonly logger = new Logger(DirectusHttpClient.name);
  private readonly timeoutMs = 8000;
  private loginCachedToken: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async get<T>(path: string, params?: QueryParams): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', path, { body });
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH',
    path: string,
    options: RequestOptions,
  ): Promise<T> {
    const baseUrl = this.getConfigValue('DIRECTUS_URL', 'Directus URL');
    const url = `${baseUrl}${path}`;
    const initialToken = this.resolveToken();

    try {
      return await this.send<T>(method, url, options, initialToken);
    } catch (error) {
      if (!this.isAuthError(error)) {
        throw error;
      }

      const refreshedToken = await this.loginAndGetToken(baseUrl);
      this.loginCachedToken = refreshedToken;
      return this.send<T>(method, url, options, refreshedToken);
    }
  }

  private async send<T>(
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    options: RequestOptions,
    token: string | null,
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      params: options.params,
      data: options.body,
      timeout: this.timeoutMs,
    };

    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        if (status >= 400 && status !== 401 && status !== 403) {
          const payload = error.response.data;
          const detail =
            typeof payload === 'string'
              ? payload
              : JSON.stringify(payload).slice(0, 600);
          this.logger.error(`Directus ${method} ${url} → ${status}: ${detail}`);
        }
      }
      throw error;
    }
  }

  private resolveToken(): string | null {
    if (this.loginCachedToken) {
      return this.loginCachedToken;
    }
    const configured = this.configService.get<string>('DIRECTUS_TOKEN')?.trim();
    return configured && configured.length > 0 ? configured : null;
  }

  private async loginAndGetToken(baseUrl: string): Promise<string> {
    const email = this.getConfigValue('DIRECTUS_EMAIL', 'Directus Email');
    const password = this.getConfigValue(
      'DIRECTUS_PASSWORD',
      'Directus Password',
    );

    const response = await axios.post<DirectusAuthLoginResponse>(
      `${baseUrl}/auth/login`,
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: this.timeoutMs,
      },
    );

    const token = response.data?.data?.access_token?.trim();
    if (!token) {
      throw new Error('Directus 로그인 토큰을 가져오지 못했습니다.');
    }
    return token;
  }

  private isAuthError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false;
    }
    return error.response?.status === 401 || error.response?.status === 403;
  }

  private getConfigValue(key: string, label: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      this.logger.error(`${label} is not configured`, { key });
      throw new Error(`${label}이(가) 설정되지 않았습니다.`);
    }
    return value;
  }
}
