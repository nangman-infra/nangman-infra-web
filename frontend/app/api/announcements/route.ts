import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const ANNOUNCEMENTS_BACKEND_PATH = '/api/v1/notices';

function getAnnouncementCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }

  const payload = data.data;
  return Array.isArray(payload) ? payload.length : 0;
}

export async function GET() {
  return proxyBackendEndpoint({
    context: 'Announcements API',
    action: 'GET',
    backendPath: ANNOUNCEMENTS_BACKEND_PATH,
    method: 'GET',
    fallbackErrorMessage: '공지사항을 가져오는데 실패했습니다.',
    successFallback: { success: true, data: [] },
    successMetadata: (data) => ({ totalAnnouncements: getAnnouncementCount(data) }),
  });
}
