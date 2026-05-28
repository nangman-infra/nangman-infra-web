import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { GetBlogPostsPageUseCase } from './application/use-cases/get-blog-posts-page.use-case';
import { SyncBlogPostsUseCase } from './application/use-cases/sync-blog-posts.use-case';
import { BlogSyncScheduler } from './application/scheduler/blog-sync.scheduler';
import { BLOG_FEED_READER } from './domain/ports/blog-feed-reader.port';
import { BLOG_POST_REPOSITORY } from './domain/ports/blog-post-repository.port';
import { BLOG_SOURCE_PROVIDER } from './domain/ports/blog-source-provider.port';
import { BLOG_SOURCE_WRITER } from './domain/ports/blog-source-writer.port';
import { DirectusBlogPostRepositoryAdapter } from './infrastructure/directus/directus-blog-post-repository.adapter';
import { DirectusBlogSourceProviderAdapter } from './infrastructure/directus/directus-blog-source-provider.adapter';
import { DirectusBlogSourceWriterAdapter } from './infrastructure/directus/directus-blog-source-writer.adapter';
import { DirectusHttpClient } from './infrastructure/directus/directus-http-client';
import { RssBlogFeedReaderAdapter } from './infrastructure/feed/rss-blog-feed-reader.adapter';

@Module({
  controllers: [BlogController],
  providers: [
    BlogService,
    GetBlogPostsPageUseCase,
    SyncBlogPostsUseCase,
    BlogSyncScheduler,
    DirectusHttpClient,
    DirectusBlogSourceProviderAdapter,
    DirectusBlogPostRepositoryAdapter,
    DirectusBlogSourceWriterAdapter,
    RssBlogFeedReaderAdapter,
    {
      provide: BLOG_SOURCE_PROVIDER,
      useExisting: DirectusBlogSourceProviderAdapter,
    },
    {
      provide: BLOG_POST_REPOSITORY,
      useExisting: DirectusBlogPostRepositoryAdapter,
    },
    {
      provide: BLOG_SOURCE_WRITER,
      useExisting: DirectusBlogSourceWriterAdapter,
    },
    {
      provide: BLOG_FEED_READER,
      useExisting: RssBlogFeedReaderAdapter,
    },
  ],
})
export class BlogModule {}
