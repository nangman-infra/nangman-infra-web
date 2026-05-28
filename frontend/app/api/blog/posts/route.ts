import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const BLOG_BACKEND_PATH = '/api/v1/blog/posts';
const ALLOWED_QUERY_KEYS = new Set([
  'page',
  'pageSize',
  'author',
  'search',
  'sort',
]);

function buildBackendPath(requestUrl: string): string {
  const { searchParams } = new URL(requestUrl);
  const forwarded = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (ALLOWED_QUERY_KEYS.has(key)) {
      forwarded.set(key, value);
    }
  }
  const query = forwarded.toString();
  return query.length > 0 ? `${BLOG_BACKEND_PATH}?${query}` : BLOG_BACKEND_PATH;
}

function getPostCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }
  const payload = (data as { data: unknown }).data;
  if (payload && typeof payload === 'object' && 'posts' in payload) {
    const posts = (payload as { posts: unknown }).posts;
    return Array.isArray(posts) ? posts.length : 0;
  }
  return 0;
}

export async function GET(request: Request) {
  return proxyBackendEndpoint({
    context: 'Blog API',
    action: 'GET',
    backendPath: buildBackendPath(request.url),
    method: 'GET',
    fallbackErrorMessage: '블로그 포스트를 가져오는데 실패했습니다.',
    successFallback: {
      success: true,
      data: { posts: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
    },
    successMetadata: (data) => ({ totalPosts: getPostCount(data) }),
  });
}
