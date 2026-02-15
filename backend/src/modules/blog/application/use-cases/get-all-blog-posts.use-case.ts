import { Inject, Injectable, Logger } from '@nestjs/common';
import { BlogPost } from '../../domain/blog-post';
import { BlogFeedItem } from '../../domain/blog-feed-item';
import { MemberBlogConfig } from '../../domain/member-blog-config';
import { BLOG_CACHE, BlogCachePort } from '../../domain/ports/blog-cache.port';
import {
  BLOG_FEED_READER,
  BlogFeedReaderPort,
} from '../../domain/ports/blog-feed-reader.port';
import {
  BLOG_SOURCE_PROVIDER,
  BlogSourceProviderPort,
} from '../../domain/ports/blog-source-provider.port';

@Injectable()
export class GetAllBlogPostsUseCase {
  private readonly logger = new Logger(GetAllBlogPostsUseCase.name);
  private readonly cacheKey = 'all_blog_posts';
  private readonly cacheTtlMs = 3600 * 1000; // 1 hour in milliseconds
  private readonly maxPostCount = 50;

  constructor(
    @Inject(BLOG_CACHE) private readonly blogCache: BlogCachePort,
    @Inject(BLOG_FEED_READER)
    private readonly blogFeedReader: BlogFeedReaderPort,
    @Inject(BLOG_SOURCE_PROVIDER)
    private readonly blogSourceProvider: BlogSourceProviderPort,
  ) {}

  async execute(): Promise<BlogPost[]> {
    const cachedPosts = await this.blogCache.get(this.cacheKey);
    if (cachedPosts) {
      this.logger.log('Returning cached blog posts');
      return cachedPosts;
    }

    this.logger.log('Fetching fresh blog posts from RSS feeds');

    const feedPromises = this.blogSourceProvider
      .getSources()
      .map(async (member) => {
        try {
          const items = await this.blogFeedReader.read(member.rssUrl);
          return items
            .map((item) => this.normalizePost(item, member))
            .filter((post): post is BlogPost => post !== null);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to fetch RSS for ${member.name}: ${message}`,
          );
          return [];
        }
      });

    const results = await Promise.all(feedPromises);
    const topPosts = results
      .flat()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, this.maxPostCount);

    await this.blogCache.set(this.cacheKey, topPosts, this.cacheTtlMs);
    return topPosts;
  }

  private normalizePost(
    item: BlogFeedItem,
    member: MemberBlogConfig,
  ): BlogPost | null {
    if (!this.isBlogFeedItem(item)) {
      this.logger.warn(`Invalid RSS item from ${member.name}: non-object item`);
      return null;
    }

    const link = this.toOptionalString(item.link);
    if (!link) {
      this.logger.warn(
        `Invalid RSS item from ${member.name}: missing required link`,
      );
      return null;
    }

    const descriptionSource =
      this.toOptionalString(item.contentSnippet) ??
      this.toOptionalString(item.content) ??
      '';
    const cleanDescription = this.sanitizeDescription(descriptionSource);

    return {
      title: this.toOptionalString(item.title) ?? 'No Title',
      description: cleanDescription,
      link,
      date: this.toIsoDate(item.isoDate),
      author: member.name,
      authorImage: member.profileImage,
      platform: member.platform,
      tags: this.toTags(item.categories),
    };
  }

  private isBlogFeedItem(value: unknown): value is BlogFeedItem {
    return typeof value === 'object' && value !== null;
  }

  private toOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toIsoDate(value: unknown): string {
    const rawValue = this.toOptionalString(value);
    if (!rawValue) {
      return new Date().toISOString();
    }

    const timestamp = Date.parse(rawValue);
    if (Number.isNaN(timestamp)) {
      return new Date().toISOString();
    }

    return new Date(timestamp).toISOString();
  }

  private sanitizeDescription(description: string): string {
    const plainText = description.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) {
      return 'No description available.';
    }
    return plainText.length > 200 ? `${plainText.slice(0, 200)}...` : plainText;
  }

  private toTags(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 4);
  }
}
