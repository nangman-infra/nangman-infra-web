import { Inject, Injectable, Logger } from '@nestjs/common';
import { decode } from 'he';
import { BlogFeedItem } from '../../domain/blog-feed-item';
import { BlogSource } from '../../domain/blog-source';
import { normalizeBlogPostLink } from '../../domain/link-normalizer';
import {
  BLOG_FEED_READER,
  BlogFeedReaderPort,
} from '../../domain/ports/blog-feed-reader.port';
import {
  BLOG_POST_REPOSITORY,
  BlogPostRepositoryPort,
  CreateBlogPostInput,
} from '../../domain/ports/blog-post-repository.port';
import {
  BLOG_SOURCE_PROVIDER,
  BlogSourceProviderPort,
} from '../../domain/ports/blog-source-provider.port';
import {
  BLOG_SOURCE_WRITER,
  BlogSourceWriterPort,
} from '../../domain/ports/blog-source-writer.port';

export interface SyncBlogPostsResult {
  totalSources: number;
  fetchedItems: number;
  insertedPosts: number;
  failedSources: ReadonlyArray<{ sourceId: number; error: string }>;
}

interface FetchedFeed {
  source: BlogSource;
  items: BlogFeedItem[];
  error: string | null;
}

const DESCRIPTION_MAX_LENGTH = 200;
const TAGS_MAX_COUNT = 4;

@Injectable()
export class SyncBlogPostsUseCase {
  private readonly logger = new Logger(SyncBlogPostsUseCase.name);

  constructor(
    @Inject(BLOG_SOURCE_PROVIDER)
    private readonly sourceProvider: BlogSourceProviderPort,
    @Inject(BLOG_FEED_READER)
    private readonly feedReader: BlogFeedReaderPort,
    @Inject(BLOG_POST_REPOSITORY)
    private readonly postRepository: BlogPostRepositoryPort,
    @Inject(BLOG_SOURCE_WRITER)
    private readonly sourceWriter: BlogSourceWriterPort,
  ) {}

  async execute(): Promise<SyncBlogPostsResult> {
    const sources = await this.sourceProvider.getEnabledSources();
    if (sources.length === 0) {
      this.logger.warn('No enabled blog sources — skipping sync');
      return {
        totalSources: 0,
        fetchedItems: 0,
        insertedPosts: 0,
        failedSources: [],
      };
    }

    const fetchedAt = new Date();
    const feeds = await Promise.all(
      sources.map((source) => this.fetchFeed(source)),
    );

    await this.persistSourceObservability(feeds, fetchedAt);

    const candidates = this.collectCandidates(feeds);
    if (candidates.length === 0) {
      return this.summarize(sources.length, feeds, 0, 0);
    }

    const candidateLinks = candidates.map((candidate) => candidate.link);
    const existing = await this.postRepository.findExistingLinks(
      Array.from(new Set(candidateLinks)),
    );

    const newPosts = this.filterNewPosts(candidates, existing);
    const insertedPosts =
      newPosts.length > 0 ? await this.postRepository.createMany(newPosts) : 0;

    return this.summarize(
      sources.length,
      feeds,
      candidates.length,
      insertedPosts,
    );
  }

  private async fetchFeed(source: BlogSource): Promise<FetchedFeed> {
    try {
      const items = await this.feedReader.read(source.rssUrl);
      return { source, items, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`RSS fetch failed for ${source.name}: ${message}`);
      return { source, items: [], error: message };
    }
  }

  private async persistSourceObservability(
    feeds: readonly FetchedFeed[],
    at: Date,
  ): Promise<void> {
    await Promise.all(
      feeds.map((feed) => {
        if (feed.error === null) {
          return this.sourceWriter.recordSuccess(feed.source.id, at);
        }
        return this.sourceWriter.recordError(feed.source.id, feed.error);
      }),
    );
  }

  private collectCandidates(
    feeds: readonly FetchedFeed[],
  ): readonly CreateBlogPostInput[] {
    const seen = new Set<string>();
    const candidates: CreateBlogPostInput[] = [];

    for (const feed of feeds) {
      for (const item of feed.items) {
        const candidate = this.normalizeItem(item, feed.source);
        if (!candidate) {
          continue;
        }
        if (seen.has(candidate.link)) {
          continue;
        }
        seen.add(candidate.link);
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  private filterNewPosts(
    candidates: readonly CreateBlogPostInput[],
    existing: ReadonlySet<string>,
  ): readonly CreateBlogPostInput[] {
    return candidates.filter((candidate) => !existing.has(candidate.link));
  }

  private normalizeItem(
    item: BlogFeedItem,
    source: BlogSource,
  ): CreateBlogPostInput | null {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const rawLink = this.toOptionalString(item.link);
    if (!rawLink) {
      return null;
    }

    const link = normalizeBlogPostLink(rawLink);
    const publishedAt = this.toIsoDate(item.isoDate);
    const title = this.toOptionalString(item.title) ?? 'No Title';
    const description = this.buildDescription(item);
    const tags = this.toTags(item.categories);

    return {
      title,
      description,
      link,
      publishedAt,
      tags,
      sourceId: source.id,
    };
  }

  private buildDescription(item: BlogFeedItem): string {
    const raw =
      this.toOptionalString(item.contentSnippet) ??
      this.toOptionalString(item.content) ??
      '';
    const plain = raw.replaceAll(/<[^>]*>?/gm, '').trim();
    if (plain.length === 0) {
      return 'No description available.';
    }
    if (plain.length > DESCRIPTION_MAX_LENGTH) {
      return `${plain.slice(0, DESCRIPTION_MAX_LENGTH)}...`;
    }
    return plain;
  }

  private toOptionalString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = this.decodeHtmlEntities(value).trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private decodeHtmlEntities(value: string): string {
    return decode(value, { isAttributeValue: false, strict: false });
  }

  private toIsoDate(value: unknown): string {
    const raw = this.toOptionalString(value);
    if (!raw) {
      return new Date().toISOString();
    }
    const timestamp = Date.parse(raw);
    if (Number.isNaN(timestamp)) {
      return new Date().toISOString();
    }
    return new Date(timestamp).toISOString();
  }

  private toTags(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((tag) => this.toOptionalString(tag))
      .filter((tag): tag is string => tag !== null)
      .slice(0, TAGS_MAX_COUNT);
  }

  private summarize(
    totalSources: number,
    feeds: readonly FetchedFeed[],
    fetchedItems: number,
    insertedPosts: number,
  ): SyncBlogPostsResult {
    const failedSources = feeds
      .filter((feed) => feed.error !== null)
      .map((feed) => ({
        sourceId: feed.source.id,
        error: feed.error ?? 'unknown',
      }));

    return {
      totalSources,
      fetchedItems,
      insertedPosts,
      failedSources,
    };
  }
}
