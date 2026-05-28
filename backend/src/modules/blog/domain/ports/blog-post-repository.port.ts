import { BlogPost } from '../blog-post';

export const BLOG_POST_REPOSITORY = Symbol('BLOG_POST_REPOSITORY');

export interface CreateBlogPostInput {
  title: string;
  description: string;
  link: string;
  publishedAt: string; // ISO String
  tags: string[];
  sourceId: number;
}

export type BlogPostSort = 'latest' | 'oldest' | 'author';

export interface FindPageInput {
  offset: number;
  limit: number;
  author?: string;
  search?: string;
  sort?: BlogPostSort;
}

export interface FindPageResult {
  posts: BlogPost[];
  total: number;
}

export interface BlogPostRepositoryPort {
  findPage(input: FindPageInput): Promise<FindPageResult>;
  findExistingLinks(links: readonly string[]): Promise<Set<string>>;
  createMany(posts: readonly CreateBlogPostInput[]): Promise<number>;
}
