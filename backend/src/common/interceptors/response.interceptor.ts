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

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
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
