import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { BACKEND_URL } from '@/lib/config';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

const CONTACT_BACKEND_PATH = '/api/v1/contact';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logInfo('Contact API 요청 수신', {
      context: 'ContactAPI',
      action: 'POST',
      hasBody: !!body,
    });

    // 백엔드로 프록시
    const response = await fetchBackend(CONTACT_BACKEND_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await parseJsonSafely(response);
    const fallbackMessage = '메시지 전송에 실패했습니다.';
    const message = getErrorMessage(data, fallbackMessage);

    if (!response.ok) {
      logWarn('Contact API 백엔드 응답 실패', {
        context: 'ContactAPI',
        action: 'POST',
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

    logInfo('Contact API 요청 성공', {
      context: 'ContactAPI',
      action: 'POST',
    });

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn('Contact API 백엔드 응답 시간 초과', {
        context: 'ContactAPI',
        action: 'POST',
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

    logError('Contact API 오류 발생', error, {
      context: 'ContactAPI',
      action: 'POST',
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
