import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const AUTHORS_BACKEND_PATH = '/api/v1/blog/authors';

export async function GET() {
  return proxyBackendEndpoint({
    context: 'Blog Authors API',
    action: 'GET',
    backendPath: AUTHORS_BACKEND_PATH,
    method: 'GET',
    fallbackErrorMessage: '작성자 목록을 가져오는데 실패했습니다.',
    successFallback: { success: true, data: { authors: [] } },
  });
}
