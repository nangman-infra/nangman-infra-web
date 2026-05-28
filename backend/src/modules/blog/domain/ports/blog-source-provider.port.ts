import { BlogSource } from '../blog-source';

export const BLOG_SOURCE_PROVIDER = Symbol('BLOG_SOURCE_PROVIDER');

export interface BlogSourceProviderPort {
  getEnabledSources(): Promise<BlogSource[]>;
}
