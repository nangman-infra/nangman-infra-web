import { NextResponse } from 'next/server';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { BACKEND_URL } from '@/lib/config';

export async function GET() {
  try {
    logInfo('Monitoring API 요청 수신', {
      context: 'MonitoringAPI',
      action: 'GET',
    });

    // 백엔드로 프록시
    const response = await fetch(`${BACKEND_URL}/api/v1/monitoring/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      logWarn('Monitoring API 백엔드 응답 실패', {
        context: 'MonitoringAPI',
        action: 'GET',
        status: response.status,
        error: data.message,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || '모니터링 상태를 가져오는데 실패했습니다.',
        },
        { status: response.status },
      );
    }

    logInfo('Monitoring API 요청 성공', {
      context: 'MonitoringAPI',
      action: 'GET',
      totalMonitors: data.data?.monitors?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
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

