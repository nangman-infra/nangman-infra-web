import { NextResponse } from 'next/server';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { BACKEND_URL } from '@/lib/config';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

const BLOG_BACKEND_PATH = '/api/v1/blog/posts';

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

function getPostCount(data: unknown): number {
  if (!data || typeof data !== 'object' || !('data' in data)) {
    return 0;
  }

  const payload = data.data;
  return Array.isArray(payload) ? payload.length : 0;
}

export async function GET() {
  try {
    logInfo('Blog API 요청 수신', {
      context: 'BlogAPI',
      action: 'GET',
    });

    const response = await fetchBackend(BLOG_BACKEND_PATH, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await parseJsonSafely(response);
    const fallbackMessage = '블로그 포스트를 가져오는데 실패했습니다.';
    const message = getErrorMessage(data, fallbackMessage);

    if (!response.ok) {
      logWarn('Blog API 백엔드 응답 실패', {
        context: 'BlogAPI',
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

    logInfo('Blog API 요청 성공', {
      context: 'BlogAPI',
      action: 'GET',
      totalPosts: getPostCount(data),
    });

    return NextResponse.json(data ?? { success: true, data: [] });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn('Blog API 백엔드 응답 시간 초과', {
        context: 'BlogAPI',
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

    logError('Blog API 오류 발생', error, {
      context: 'BlogAPI',
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
