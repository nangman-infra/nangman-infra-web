import { BlogPlatform, BlogPost } from '@/lib/domain/blog';
import { fetchBlogPostsApi } from '@/lib/infrastructure/http/blog-api-client';

interface BlogProxyResponse {
  data?: unknown;
}

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

function withLegacyFields(post: BlogPost): BlogPost {
  return {
    ...post,
    url: post.link,
    id: post.link,
    slug: post.link,
  };
}

function parseBlogPosts(payload: unknown): BlogPost[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as BlogProxyResponse;
  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data.filter(isBlogPost).map(withLegacyFields);
}

interface GetLatestBlogPostsUseCaseInput {
  count: number;
  fallback: BlogPost[];
}

export async function getLatestBlogPostsUseCase(
  input: GetLatestBlogPostsUseCaseInput,
): Promise<BlogPost[]> {
  const { count, fallback } = input;

  try {
    const payload = await fetchBlogPostsApi();
    const posts = parseBlogPosts(payload);

    if (posts.length === 0) {
      return fallback.slice(0, count);
    }

    return posts.slice(0, count);
  } catch {
    return fallback.slice(0, count);
  }
}
