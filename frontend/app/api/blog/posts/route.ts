import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const BLOG_BACKEND_PATH = '/api/v1/blog/posts';

function getPostCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }

  const payload = data.data;
  return Array.isArray(payload) ? payload.length : 0;
}

export async function GET() {
  return proxyBackendEndpoint({
    context: 'Blog API',
    action: 'GET',
    backendPath: BLOG_BACKEND_PATH,
    method: 'GET',
    fallbackErrorMessage: '블로그 포스트를 가져오는데 실패했습니다.',
    successFallback: { success: true, data: [] },
    successMetadata: (data) => ({ totalPosts: getPostCount(data) }),
  });
}
