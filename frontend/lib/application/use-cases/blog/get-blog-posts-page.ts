import type { BlogPost } from '@/lib/domain/blog';
import { fetchBackendJson } from '@/lib/application/server/fetch-backend-json';

const BLOG_BACKEND_PATH = '/api/v1/blog/posts';

export interface BlogPostsPage {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetBlogPostsPageInput {
  page: number;
  pageSize: number;
  fallback: BlogPost[];
  revalidateSeconds?: number;
  fetcher?: () => Promise<unknown>;
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const tags = candidate.tags;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.link === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.author === 'string' &&
    Array.isArray(tags) &&
    tags.every((tag) => typeof tag === 'string') &&
    (candidate.platform === 'tistory' ||
      candidate.platform === 'velog' ||
      candidate.platform === 'medium' ||
      candidate.platform === 'other') &&
    (candidate.authorImage === undefined ||
      typeof candidate.authorImage === 'string')
  );
}

function parsePage(payload: unknown, input: GetBlogPostsPageInput): BlogPostsPage | null {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return null;
  }
  const data = (payload as { data: unknown }).data;
  if (!data || typeof data !== 'object') {
    return null;
  }
  const record = data as Record<string, unknown>;
  const rawPosts = record.posts;
  if (!Array.isArray(rawPosts)) {
    return null;
  }
  const posts = rawPosts.filter(isBlogPost);
  const total =
    typeof record.total === 'number' && record.total >= 0
      ? record.total
      : posts.length;
  const pageSize =
    typeof record.pageSize === 'number' && record.pageSize > 0
      ? record.pageSize
      : input.pageSize;
  const page =
    typeof record.page === 'number' && record.page > 0
      ? record.page
      : input.page;
  const totalPages = resolveTotalPages(record.totalPages, total, pageSize);
  return { posts, total, page, pageSize, totalPages };
}

function resolveTotalPages(
  rawTotalPages: unknown,
  total: number,
  pageSize: number,
): number {
  if (typeof rawTotalPages === 'number' && rawTotalPages >= 0) {
    return rawTotalPages;
  }
  if (pageSize > 0) {
    return Math.ceil(total / pageSize);
  }
  return 0;
}

function buildFallbackPage(input: GetBlogPostsPageInput): BlogPostsPage {
  const slice = input.fallback.slice(0, input.pageSize);
  const total = input.fallback.length;
  return {
    posts: slice,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages: input.pageSize > 0 ? Math.ceil(total / input.pageSize) : 0,
  };
}

export async function getBlogPostsPageUseCase(
  input: GetBlogPostsPageInput,
): Promise<BlogPostsPage> {
  const defaultFetcher = () =>
    fetchBackendJson({
      backendPath: `${BLOG_BACKEND_PATH}?page=${input.page}&pageSize=${input.pageSize}`,
      revalidate: input.revalidateSeconds,
    });

  try {
    const payload = await (input.fetcher ?? defaultFetcher)();
    const parsed = parsePage(payload, input);
    if (!parsed || parsed.posts.length === 0) {
      return buildFallbackPage(input);
    }
    return parsed;
  } catch {
    return buildFallbackPage(input);
  }
}
