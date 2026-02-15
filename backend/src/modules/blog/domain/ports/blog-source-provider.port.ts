import { MemberBlogConfig } from '../member-blog-config';

export const BLOG_SOURCE_PROVIDER = Symbol('BLOG_SOURCE_PROVIDER');

export interface BlogSourceProviderPort {
  getSources(): MemberBlogConfig[];
}
