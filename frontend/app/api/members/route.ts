import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const MEMBERS_BACKEND_PATH = '/api/v1/members';

function getMemberCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }

  const payload = data.data;
  return Array.isArray(payload) ? payload.length : 0;
}

export async function GET() {
  return proxyBackendEndpoint({
    context: 'Members API',
    action: 'GET',
    backendPath: MEMBERS_BACKEND_PATH,
    method: 'GET',
    fallbackErrorMessage: '멤버 정보를 가져오는데 실패했습니다.',
    successFallback: { success: true, data: [] },
    successMetadata: (data) => ({ totalMembers: getMemberCount(data) }),
  });
}
