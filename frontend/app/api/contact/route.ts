import { NextRequest, NextResponse } from 'next/server';
import { proxyBackendEndpoint } from '@/lib/application/server/proxy-backend-endpoint';
import { logError } from '@/lib/logger/logger';

const CONTACT_BACKEND_PATH = '/api/v1/contact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return proxyBackendEndpoint({
      context: 'Contact API',
      action: 'POST',
      backendPath: CONTACT_BACKEND_PATH,
      method: 'POST',
      body,
      fallbackErrorMessage: '메시지 전송에 실패했습니다.',
      successFallback: { success: true },
      requestMetadata: {
        hasBody: !!body,
      },
    });
  } catch (error) {
    logError('Contact API 오류 발생', error, {
      context: 'Contact API',
      action: 'POST',
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
