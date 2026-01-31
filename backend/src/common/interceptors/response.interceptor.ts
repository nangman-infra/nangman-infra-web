import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * 응답 인터셉터
 * 모든 성공 응답을 표준 형식으로 변환
 * { success: true, data: ... } 형식으로 래핑
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  /**
   * 응답을 표준 형식으로 변환
   *
   * @param {ExecutionContext} context - 실행 컨텍스트
   * @param {CallHandler} next - 다음 핸들러
   * @returns {Observable<Response<T>>} 변환된 응답
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 이미 success 필드가 있는 경우 그대로 반환 (에러 응답 등)
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // 일반 응답을 표준 형식으로 변환
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
