import { MonitoringStatusResponse } from '@/lib/application/contracts/monitoring';
import { getApiJson } from '@/lib/infrastructure/http/json-api-client';

const MONITORING_API_PATH = '/monitoring/status';
const MONITORING_ERROR_MESSAGE = '모니터링 상태를 가져오는데 실패했습니다.';

export async function getMonitoringStatusUseCase(): Promise<MonitoringStatusResponse> {
  return getApiJson<MonitoringStatusResponse>(
    MONITORING_API_PATH,
    MONITORING_ERROR_MESSAGE,
    {
      cache: 'no-store',
    },
  );
}
