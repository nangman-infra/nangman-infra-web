import { Injectable, ExecutionContext } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerException,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { Request } from 'express';

/**
 * 이메일 기반 Rate Limiting Guard
 * Contact Form에서 동일 이메일로 1시간에 5회 제한
 */
@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
  /**
   * Request Body에서 이메일을 추출하여 키로 사용
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Request Body에서 이메일 추출
    const email = req.body?.email;

    if (!email || typeof email !== 'string') {
      // 이메일이 없으면 IP 기반으로 폴백 (ValidationPipe가 먼저 체크하지만 안전장치)
      return req.ip || 'unknown';
    }

    // 이메일을 소문자로 정규화하여 키로 사용
    return `email:${email.toLowerCase().trim()}`;
  }

  /**
   * ThrottlerException 발생 시 사용자 친화적인 메시지
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const email = request.body?.email || '이메일';

    throw new ThrottlerException(
      `요청이 너무 많습니다. ${email}로는 1시간에 5회까지만 요청할 수 있습니다. 잠시 후 다시 시도해주세요.`,
    );
  }
}
