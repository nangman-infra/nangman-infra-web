import { Injectable, Logger } from '@nestjs/common';
import { BlogSource } from '../../domain/blog-source';
import { isBlogPlatform } from '../../domain/blog-platform';
import { BlogSourceProviderPort } from '../../domain/ports/blog-source-provider.port';
import { DirectusHttpClient } from './directus-http-client';

interface DirectusListResponse {
  data?: unknown;
}

@Injectable()
export class DirectusBlogSourceProviderAdapter implements BlogSourceProviderPort {
  private readonly logger = new Logger(DirectusBlogSourceProviderAdapter.name);
  private readonly path = '/items/blog_sources';

  constructor(private readonly http: DirectusHttpClient) {}

  async getEnabledSources(): Promise<BlogSource[]> {
    try {
      const response = await this.http.get<DirectusListResponse>(this.path, {
        'filter[enabled][_eq]': 'true',
        sort: 'sort',
        limit: -1,
      });

      const sources = this.parseSources(response.data);
      this.logger.log(`Fetched ${sources.length} enabled blog sources`);
      return sources;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch blog sources: ${message}`);
      return [];
    }
  }

  private parseSources(payload: unknown): BlogSource[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => this.parseSource(item))
      .filter((source): source is BlogSource => source !== null);
  }

  private parseSource(payload: unknown): BlogSource | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const item = payload as Record<string, unknown>;
    const id = this.toPositiveInteger(item.id);
    const name = this.toNonEmptyString(item.name);
    const rssUrl = this.toNonEmptyString(item.rss_url);
    const platform = item.platform;

    if (id === null || name === null || rssUrl === null) {
      return null;
    }
    if (!isBlogPlatform(platform)) {
      return null;
    }

    return {
      id,
      name,
      rssUrl,
      platform,
      profileImage: this.toNonEmptyString(item.profile_image),
    };
  }

  private toPositiveInteger(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  }

  private toNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
