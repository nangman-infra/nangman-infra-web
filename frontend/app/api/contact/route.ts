import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo, logWarn } from '@/lib/logger/logger';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3333';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    logInfo('Contact API 요청 수신', {
      context: 'ContactAPI',
      action: 'POST',
      hasBody: !!body,
      name: body?.name,
      email: body?.email,
    });

    // 백엔드로 프록시
    const response = await fetch(`${BACKEND_URL}/api/v1/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      logWarn('Contact API 백엔드 응답 실패', {
        context: 'ContactAPI',
        action: 'POST',
        status: response.status,
        error: data.message,
        name: body?.name,
        email: body?.email,
      });

      return NextResponse.json(
        {
          success: false,
          message: data.message || '메시지 전송에 실패했습니다.',
        },
        { status: response.status },
      );
    }

    logInfo('Contact API 요청 성공', {
      context: 'ContactAPI',
      action: 'POST',
      name: body?.name,
      email: body?.email,
    });

    return NextResponse.json(data);
  } catch (error) {
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

