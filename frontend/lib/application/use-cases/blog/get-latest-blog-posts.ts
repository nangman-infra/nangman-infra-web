import { BlogPlatform, BlogPost } from '@/lib/domain/blog';
import { fetchBlogPostsApi } from '@/lib/infrastructure/http/blog-api-client';

function isBlogPlatform(value: unknown): value is BlogPlatform {
  return (
    value === 'tistory' ||
    value === 'velog' ||
    value === 'medium' ||
    value === 'other'
  );
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const tags = candidate.tags;
  const hasValidTags =
    Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.link === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.author === 'string' &&
    hasValidTags &&
    isBlogPlatform(candidate.platform) &&
    (candidate.authorImage === undefined ||
      typeof candidate.authorImage === 'string')
  );
}

function parseBlogPosts(payload: unknown): BlogPost[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return [];
  }

  const data = (payload as { data: unknown }).data;
  if (!data || typeof data !== 'object') {
    return [];
  }

  const posts = (data as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.filter(isBlogPost);
}

interface GetLatestBlogPostsUseCaseInput {
  count: number;
  fallback: BlogPost[];
  fetcher?: () => Promise<unknown>;
}

export async function getLatestBlogPostsUseCase(
  input: GetLatestBlogPostsUseCaseInput,
): Promise<BlogPost[]> {
  const { count, fallback, fetcher = () => fetchBlogPostsApi({ pageSize: count }) } =
    input;

  try {
    const payload = await fetcher();
    const posts = parseBlogPosts(payload);

    if (posts.length === 0) {
      return fallback.slice(0, count);
    }

    return posts.slice(0, count);
  } catch {
    return fallback.slice(0, count);
  }
}
