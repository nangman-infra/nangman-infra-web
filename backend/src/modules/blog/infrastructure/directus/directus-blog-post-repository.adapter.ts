import { Injectable, Logger } from '@nestjs/common';
import { BlogPost } from '../../domain/blog-post';
import { isBlogPlatform } from '../../domain/blog-platform';
import {
  BlogPostRepositoryPort,
  CreateBlogPostInput,
  FindPageInput,
  FindPageResult,
} from '../../domain/ports/blog-post-repository.port';
import { DirectusHttpClient } from './directus-http-client';

interface DirectusListResponse {
  data?: unknown;
  meta?: { total_count?: unknown; filter_count?: unknown };
}

const EXISTING_LINKS_CHUNK_SIZE = 30;

@Injectable()
export class DirectusBlogPostRepositoryAdapter implements BlogPostRepositoryPort {
  private readonly logger = new Logger(DirectusBlogPostRepositoryAdapter.name);
  private readonly path = '/items/blog_posts';
  private readonly readFields =
    'title,description,link,published_at,tags,source.name,source.profile_image,source.platform';

  constructor(private readonly http: DirectusHttpClient) {}

  async findPage(input: FindPageInput): Promise<FindPageResult> {
    try {
      const params: Record<string, string | number | boolean> = {
        fields: this.readFields,
        sort: this.resolveSort(input.sort),
        limit: input.limit,
        offset: input.offset,
        meta: 'total_count,filter_count',
      };

      if (input.author && input.author.trim().length > 0) {
        params['filter[source][name][_eq]'] = input.author.trim();
      }

      if (input.search && input.search.trim().length > 0) {
        params.search = input.search.trim();
      }

      const response = await this.http.get<DirectusListResponse>(
        this.path,
        params,
      );

      const posts = this.parsePosts(response.data);
      const total = this.parseTotalCount(response.meta);
      this.logger.log(
        `Fetched ${posts.length} posts (offset=${input.offset}, limit=${input.limit}, total=${total}, author=${input.author ?? '-'}, search=${input.search ?? '-'}, sort=${input.sort ?? 'latest'})`,
      );
      return { posts, total };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch blog posts: ${message}`);
      return { posts: [], total: 0 };
    }
  }

  private resolveSort(sort: FindPageInput['sort']): string {
    if (sort === 'oldest') {
      return 'published_at';
    }
    if (sort === 'author') {
      return 'source.name,-published_at';
    }
    return '-published_at';
  }

  private parseTotalCount(meta: DirectusListResponse['meta']): number {
    const filtered = meta?.filter_count;
    if (
      typeof filtered === 'number' &&
      Number.isFinite(filtered) &&
      filtered >= 0
    ) {
      return filtered;
    }
    const value = meta?.total_count;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }
    return 0;
  }

  async findExistingLinks(links: readonly string[]): Promise<Set<string>> {
    const found = new Set<string>();
    if (links.length === 0) {
      return found;
    }

    for (let i = 0; i < links.length; i += EXISTING_LINKS_CHUNK_SIZE) {
      const chunk = links.slice(i, i + EXISTING_LINKS_CHUNK_SIZE);
      const response = await this.http.get<DirectusListResponse>(this.path, {
        fields: 'link',
        'filter[link][_in]': chunk.join(','),
        limit: -1,
      });

      const data = response.data;
      if (!Array.isArray(data)) {
        continue;
      }

      for (const row of data) {
        if (!row || typeof row !== 'object') {
          continue;
        }
        const link = (row as Record<string, unknown>).link;
        if (typeof link === 'string' && link.length > 0) {
          found.add(link);
        }
      }
    }

    return found;
  }

  async createMany(posts: readonly CreateBlogPostInput[]): Promise<number> {
    if (posts.length === 0) {
      return 0;
    }

    const body = posts.map((post) => ({
      title: post.title,
      description: post.description,
      link: post.link,
      published_at: post.publishedAt,
      tags: post.tags,
      source: post.sourceId,
    }));

    await this.http.post(this.path, body);
    this.logger.log(`Inserted ${posts.length} new blog posts`);
    return posts.length;
  }

  private parsePosts(payload: unknown): BlogPost[] {
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .map((item) => this.parsePost(item))
      .filter((post): post is BlogPost => post !== null);
  }

  private parsePost(payload: unknown): BlogPost | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const item = payload as Record<string, unknown>;
    const title = this.toNonEmptyString(item.title);
    const description = this.toNonEmptyString(item.description);
    const link = this.toNonEmptyString(item.link);
    const date = this.toIsoDate(item.published_at);

    if (!title || !description || !link || !date) {
      return null;
    }

    const source = item.source;
    if (!source || typeof source !== 'object') {
      return null;
    }

    const sourceRecord = source as Record<string, unknown>;
    const author = this.toNonEmptyString(sourceRecord.name);
    const platform = sourceRecord.platform;
    if (!author || !isBlogPlatform(platform)) {
      return null;
    }

    const post: BlogPost = {
      title,
      description,
      link,
      date,
      author,
      platform,
      tags: this.toTagsArray(item.tags),
    };

    const authorImage = this.toNonEmptyString(sourceRecord.profile_image);
    if (authorImage) {
      post.authorImage = authorImage;
    }

    return post;
  }

  private toNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toIsoDate(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp).toISOString();
  }

  private toTagsArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((tag) => this.toNonEmptyString(tag))
      .filter((tag): tag is string => tag !== null);
  }
}
