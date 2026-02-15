import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';

const MONITORING_BACKEND_PATH = '/api/v1/monitoring/status';

function getMonitorCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }

  const payload = data.data;
  if (!payload || typeof payload !== 'object' || !('monitors' in payload)) {
    return 0;
  }

  return Array.isArray(payload.monitors) ? payload.monitors.length : 0;
}

export async function GET() {
  return proxyBackendEndpoint({
    context: 'Monitoring API',
    action: 'GET',
    backendPath: MONITORING_BACKEND_PATH,
    method: 'GET',
    fallbackErrorMessage: '모니터링 상태를 가져오는데 실패했습니다.',
    successFallback: { success: true },
    successMetadata: (data) => ({ totalMonitors: getMonitorCount(data) }),
  });
}
