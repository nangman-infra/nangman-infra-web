import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

interface RouteContext {
  params: Promise<{ identifier: string }> | { identifier: string };
}

const PORTFOLIO_PDF_TIMEOUT_MS = 65_000;

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

function buildFallbackFileName(identifier: string): string {
  const safe = identifier
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${safe || 'member'}-portfolio.pdf`;
}

export async function GET(
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
  )}/portfolio/pdf`;

  try {
    logInfo('Members Portfolio PDF 요청 수신', {
      context: 'Members Portfolio PDF API',
      action: 'GET',
      identifier,
    });

    const response = await fetchBackend(
      backendPath,
      {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
        cache: 'no-store',
      },
      PORTFOLIO_PDF_TIMEOUT_MS,
    );

    if (!response.ok) {
      const data = await parseJsonSafely(response);
      const message = resolveErrorMessage(
        data,
        '포트폴리오 PDF를 내려받는데 실패했습니다.',
      );

      logWarn('Members Portfolio PDF 백엔드 응답 실패', {
        context: 'Members Portfolio PDF API',
        action: 'GET',
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

    const binary = await response.arrayBuffer();
    const headers = new Headers();
    headers.set(
      'Content-Type',
      response.headers.get('content-type') || 'application/pdf',
    );
    headers.set(
      'Content-Disposition',
      response.headers.get('content-disposition') ||
        `attachment; filename="${buildFallbackFileName(identifier)}"`,
    );
    headers.set('Cache-Control', 'no-store');

    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(binary, {
      status: 200,
      headers,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn('Members Portfolio PDF 백엔드 응답 시간 초과', {
        context: 'Members Portfolio PDF API',
        action: 'GET',
        identifier,
        status: 504,
        backendUrl: BACKEND_URL,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            '백엔드 응답 시간이 초과되었습니다. 포트폴리오 생성은 30초~1분 정도 소요될 수 있습니다.',
        },
        { status: 504 },
      );
    }

    logError('Members Portfolio PDF 오류 발생', error, {
      context: 'Members Portfolio PDF API',
      action: 'GET',
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
