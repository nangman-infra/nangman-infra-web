import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

interface RouteContext {
  params: Promise<{ identifier: string }> | { identifier: string };
}

function resolveErrorMessage(data: unknown, fallback: string): string {
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

function decodeIdentifier(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const params = await context.params;
  const identifier = decodeIdentifier(params.identifier || '');

  if (!identifier) {
    return NextResponse.json(
      {
        success: false,
        message: '유효하지 않은 멤버 식별자입니다.',
      },
      { status: 400 },
    );
  }

  const backendPath = `/api/v1/members/${encodeURIComponent(
    identifier,
  )}/portfolio/pdf/jobs`;

  try {
    logInfo('Members Portfolio PDF Job 요청 수신', {
      context: 'Members Portfolio PDF Job API',
      action: 'POST',
      identifier,
    });

    const response = await fetchBackend(
      backendPath,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
      15000,
    );

    const data = await parseJsonSafely(response);
    if (!response.ok) {
      const message = resolveErrorMessage(
        data,
        '포트폴리오 PDF 작업을 시작하지 못했습니다.',
      );
      logWarn('Members Portfolio PDF Job 백엔드 응답 실패', {
        context: 'Members Portfolio PDF Job API',
        action: 'POST',
        identifier,
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

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn('Members Portfolio PDF Job 백엔드 응답 시간 초과', {
        context: 'Members Portfolio PDF Job API',
        action: 'POST',
        identifier,
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

    logError('Members Portfolio PDF Job 오류 발생', error, {
      context: 'Members Portfolio PDF Job API',
      action: 'POST',
      identifier,
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
