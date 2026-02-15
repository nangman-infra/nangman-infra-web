import { getApiJson } from '@/lib/infrastructure/http/json-api-client';

const BLOG_API_PATH = '/blog/posts';
const BLOG_ERROR_MESSAGE = '블로그 포스트를 가져오는데 실패했습니다.';

export async function fetchBlogPostsApi(): Promise<unknown> {
  return getApiJson<unknown>(BLOG_API_PATH, BLOG_ERROR_MESSAGE, {
    cache: 'no-store',
  });
}
