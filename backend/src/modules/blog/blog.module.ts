import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { GetAllBlogPostsUseCase } from './application/use-cases/get-all-blog-posts.use-case';
import { BLOG_CACHE } from './domain/ports/blog-cache.port';
import { BLOG_FEED_READER } from './domain/ports/blog-feed-reader.port';
import { BLOG_SOURCE_PROVIDER } from './domain/ports/blog-source-provider.port';
import { CacheManagerBlogCacheAdapter } from './infrastructure/cache/cache-manager-blog-cache.adapter';
import { StaticBlogSourceProviderAdapter } from './infrastructure/config/static-blog-source-provider.adapter';
import { RssBlogFeedReaderAdapter } from './infrastructure/feed/rss-blog-feed-reader.adapter';

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600 * 1000, // 1 hour in ms
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [BlogController],
  providers: [
    BlogService,
    GetAllBlogPostsUseCase,
    CacheManagerBlogCacheAdapter,
    RssBlogFeedReaderAdapter,
    StaticBlogSourceProviderAdapter,
    {
      provide: BLOG_CACHE,
      useExisting: CacheManagerBlogCacheAdapter,
    },
    {
      provide: BLOG_FEED_READER,
      useExisting: RssBlogFeedReaderAdapter,
    },
    {
      provide: BLOG_SOURCE_PROVIDER,
      useExisting: StaticBlogSourceProviderAdapter,
    },
  ],
})
export class BlogModule {}
