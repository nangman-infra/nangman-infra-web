import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { Notice, NoticeType } from '../../domain/notice';
import { NoticeReaderPort } from '../../domain/ports/notice-reader.port';

interface DirectusItemsResponse {
  data?: unknown;
}

interface DirectusAuthLoginResponse {
  data?: {
    access_token?: string;
  };
}

@Injectable()
export class DirectusNoticesReaderAdapter implements NoticeReaderPort {
  private readonly logger = new Logger(DirectusNoticesReaderAdapter.name);
  private readonly noticesPath = '/items/notices';
  private readonly timeoutMs = 8000;

  constructor(private readonly configService: ConfigService) {}

  async readAll(): Promise<Notice[]> {
    const baseUrl = this.getConfigValue('DIRECTUS_URL', 'Directus URL');
    const configuredToken = this.configService.get<string>('DIRECTUS_TOKEN');
    let token = configuredToken?.trim() || null;

    let response: { data: DirectusItemsResponse };

    try {
      response = await this.fetchNotices(baseUrl, token);
    } catch (error) {
      if (this.isCollectionNotFound(error)) {
        this.logger.warn(
          'Directus notices 컬렉션이 없어 빈 배열을 반환합니다.',
        );
        return [];
      }

      if (!this.isAuthError(error)) {
        throw error;
      }

      token = await this.loginAndGetToken(baseUrl);
      response = await this.fetchNotices(baseUrl, token);
    }

    const notices = this.parseNotices(response.data?.data);
    this.logger.log(`Fetched ${notices.length} notices from Directus`);

    return notices;
  }

  private async fetchNotices(
    baseUrl: string,
    token: string | null,
  ): Promise<{ data: DirectusItemsResponse }> {
    return axios.get<DirectusItemsResponse>(`${baseUrl}${this.noticesPath}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
      },
      params: {
        limit: -1,
      },
      timeout: this.timeoutMs,
    });
  }

  private async loginAndGetToken(baseUrl: string): Promise<string> {
    const email = this.getConfigValue('DIRECTUS_EMAIL', 'Directus Email');
    const password = this.getConfigValue(
      'DIRECTUS_PASSWORD',
      'Directus Password',
    );

    const response = await axios.post<DirectusAuthLoginResponse>(
      `${baseUrl}/auth/login`,
      {
        email,
        password,
      },
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

  private isCollectionNotFound(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    return error.response?.status === 404;
  }

  private getConfigValue(key: string, label: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      this.logger.error(`${label} is not configured`, { key });
      throw new Error(`${label}이(가) 설정되지 않았습니다.`);
    }

    return value;
  }

  private parseNotices(payload: unknown): Notice[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    const notices = payload
      .map((item, index) => this.normalizeNotice(item, index))
      .filter((item): item is Notice => item !== null);

    return notices.sort(
      (a, b) => this.getSortTimestamp(b) - this.getSortTimestamp(a),
    );
  }

  private normalizeNotice(payload: unknown, index: number): Notice | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const item = payload as Record<string, unknown>;
    const title = this.toOptionalString(item.title);
    if (!title) {
      return null;
    }

    const id =
      this.toOptionalId(item.id) ||
      `${this.toSlug(title)}-${String(index + 1)}`;
    const content = this.toOptionalString(item.content) || '';
    const type = this.toType(item.type);
    const publishedAt = this.resolvePublishedAt(item);
    const date = this.resolveDateLabel(item, publishedAt);

    const notice: Notice = {
      id,
      title,
      content,
      date,
      type,
    };

    if (publishedAt) {
      notice.publishedAt = publishedAt;
    }

    return notice;
  }

  private resolvePublishedAt(record: Record<string, unknown>): string | null {
    const candidates = [
      record.publishedAt,
      record.published_at,
      record.createdAt,
      record.created_at,
    ];

    for (const candidate of candidates) {
      const value = this.toOptionalString(candidate);
      if (!value) {
        continue;
      }

      const timestamp = Date.parse(value);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp).toISOString();
      }
    }

    return null;
  }

  private resolveDateLabel(
    record: Record<string, unknown>,
    publishedAt: string | null,
  ): string {
    const label =
      this.toOptionalString(record.dateLabel) ||
      this.toOptionalString(record.date_label);
    if (label) {
      return label;
    }

    const rawDate = this.toOptionalString(record.date);
    if (rawDate) {
      return this.formatDateLabel(rawDate);
    }

    if (publishedAt) {
      return this.formatDateLabel(publishedAt);
    }

    return '';
  }

  private formatDateLabel(value: string): string {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return value;
    }

    const date = new Date(timestamp);
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
  }

  private getSortTimestamp(notice: Notice): number {
    if (notice.publishedAt) {
      const timestamp = Date.parse(notice.publishedAt);
      if (!Number.isNaN(timestamp)) {
        return timestamp;
      }
    }

    const dateLabelTimestamp = Date.parse(notice.date);
    if (!Number.isNaN(dateLabelTimestamp)) {
      return dateLabelTimestamp;
    }

    return 0;
  }

  private toType(value: unknown): NoticeType {
    if (value === 'update' || value === 'notice') {
      return value;
    }

    if (value === 'event') {
      return 'update';
    }

    return 'notice';
  }

  private toOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private toOptionalId(value: unknown): string | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    return null;
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
