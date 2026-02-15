import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';
import { fetchBackend, parseJsonSafely } from '@/lib/server/backend-proxy';

interface ProxyBackendEndpointOptions {
  context: string;
  action: string;
  backendPath: string;
  method: 'GET' | 'POST';
  fallbackErrorMessage: string;
  successFallback: unknown;
  body?: unknown;
  requestMetadata?: Record<string, unknown>;
  successMetadata?: (data: unknown) => Record<string, unknown>;
}

function resolveMessage(data: unknown, fallback: string): string {
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

export async function proxyBackendEndpoint(
  options: ProxyBackendEndpointOptions,
): Promise<NextResponse> {
  const {
    context,
    action,
    backendPath,
    method,
    fallbackErrorMessage,
    successFallback,
    body,
    requestMetadata,
    successMetadata,
  } = options;

  try {
    logInfo(`${context} 요청 수신`, {
      context,
      action,
      ...(requestMetadata || {}),
    });

    const response = await fetchBackend(backendPath, {
      method,
      headers:
        method === 'POST'
          ? {
              'Content-Type': 'application/json',
            }
          : {
              Accept: 'application/json',
            },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      cache: 'no-store',
    });

    const data = await parseJsonSafely(response);
    const message = resolveMessage(data, fallbackErrorMessage);

    if (!response.ok) {
      logWarn(`${context} 백엔드 응답 실패`, {
        context,
        action,
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

    logInfo(`${context} 요청 성공`, {
      context,
      action,
      ...(successMetadata ? successMetadata(data) : {}),
    });

    return NextResponse.json(data ?? successFallback);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logWarn(`${context} 백엔드 응답 시간 초과`, {
        context,
        action,
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

    logError(`${context} 오류 발생`, error, {
      context,
      action,
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
