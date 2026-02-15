import { BlogPost } from '../blog-post';

export const BLOG_CACHE = Symbol('BLOG_CACHE');

export interface BlogCachePort {
  get(key: string): Promise<BlogPost[] | undefined>;
  set(key: string, posts: BlogPost[], ttlMs: number): Promise<void>;
}
