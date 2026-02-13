import { NextResponse } from 'next/server';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { BACKEND_URL } from '@/lib/config';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

const MONITORING_BACKEND_PATH = '/api/v1/monitoring/status';

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }
  return fallback;
}

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
  try {
    logInfo('Monitoring API 요청 수신', {
      context: 'MonitoringAPI',
      action: 'GET',
    });

    // 백엔드로 프록시
    const response = await fetchBackend(MONITORING_BACKEND_PATH, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await parseJsonSafely(response);
    const fallbackMessage = '모니터링 상태를 가져오는데 실패했습니다.';
    const message = getErrorMessage(data, fallbackMessage);

    if (!response.ok) {
      logWarn('Monitoring API 백엔드 응답 실패', {
        context: 'MonitoringAPI',
        action: 'GET',
        status: response.status,
        error: message,
      });

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: response.status },
      );
    }

    logInfo('Monitoring API 요청 성공', {
      context: 'MonitoringAPI',
      action: 'GET',
      totalMonitors: getMonitorCount(data),
    });

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn('Monitoring API 백엔드 응답 시간 초과', {
        context: 'MonitoringAPI',
        action: 'GET',
        status: 504,
        backendUrl: BACKEND_URL,
      });

      return NextResponse.json(
        {
          success: false,
          message: '백엔드 응답 시간이 초과되었습니다.',
        },
        { status: 504 },
      );
    }

    logError('Monitoring API 오류 발생', error, {
      context: 'MonitoringAPI',
      action: 'GET',
      backendUrl: BACKEND_URL,
    });

    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 },
    );
  }
}
