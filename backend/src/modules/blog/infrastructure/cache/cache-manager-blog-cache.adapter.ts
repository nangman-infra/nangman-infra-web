import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BlogPost } from '../../domain/blog-post';
import { BlogCachePort } from '../../domain/ports/blog-cache.port';

@Injectable()
export class CacheManagerBlogCacheAdapter implements BlogCachePort {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get(key: string): Promise<BlogPost[] | undefined> {
    return this.cacheManager.get<BlogPost[]>(key);
  }

  async set(key: string, posts: BlogPost[], ttlMs: number): Promise<void> {
    await this.cacheManager.set(key, posts, ttlMs);
  }
}
