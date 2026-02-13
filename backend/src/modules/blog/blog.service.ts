import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as Parser from 'rss-parser';
import axios from 'axios';
import { BlogPost, MemberBlogConfig } from './blog.interface';

interface RssItemInput {
  title?: unknown;
  contentSnippet?: unknown;
  content?: unknown;
  link?: unknown;
  isoDate?: unknown;
  categories?: unknown;
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);
  private readonly parser = new Parser();
  private readonly CACHE_KEY = 'all_blog_posts';
  private readonly CACHE_TTL = 3600 * 1000; // 1 hour in millionseconds

  private readonly MEMBER_BLOGS: MemberBlogConfig[] = [
    {
      name: 'Juno',
      rssUrl: 'http://se-juno.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/junho.png',
    },
    {
      name: 'Seongwoo',
      rssUrl: 'https://seongw00.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/seongwoo.png',
    },
    {
      name: 'Donggeon',
      rssUrl: 'https://exit0.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/donggeon.png',
    },
    {
      name: 'Taekjun',
      rssUrl: 'https://v2.velog.io/rss/iamtaekjun',
      platform: 'velog',
      profileImage: '/profiles/taekjun.png',
    },
    {
      name: 'Heehoon',
      rssUrl: 'https://heishooni.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/heehoon.png',
    },
    {
      name: 'Juhyung',
      rssUrl: 'https://artist0904.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/juhyung.png',
    },
  ];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getAllPosts(): Promise<BlogPost[]> {
    // 1. Check Cache
    const cachedPosts = await this.cacheManager.get<BlogPost[]>(this.CACHE_KEY);
    if (cachedPosts) {
      this.logger.log('Returning cached blog posts');
      return cachedPosts;
    }

    this.logger.log('Fetching fresh blog posts from RSS feeds');

    // 2. Fetch all feeds
    const feedPromises = this.MEMBER_BLOGS.map(async (member) => {
      try {
        const response = await axios.get<string>(member.rssUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          timeout: 5000,
        });

        const feed = await this.parser.parseString(response.data);
        return feed.items
          .map((item) => this.normalizePost(item, member))
          .filter((post): post is BlogPost => post !== null);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to fetch RSS for ${member.name}: ${message}`);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);

    // 3. Flatten and Sort
    const allPosts = results.flat().sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // 4. Cache (Limited to top 50)
    const topPosts = allPosts.slice(0, 50);

    await this.cacheManager.set(this.CACHE_KEY, topPosts, this.CACHE_TTL);

    return topPosts;
  }

  private normalizePost(
    item: unknown,
    member: MemberBlogConfig,
  ): BlogPost | null {
    if (!this.isRssItemInput(item)) {
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

  private isRssItemInput(value: unknown): value is RssItemInput {
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
