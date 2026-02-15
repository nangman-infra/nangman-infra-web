import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface StatusCodeError {
  statusCode: number;
  message: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.resolveStatus(exception);

    const message = this.resolveMessage(exception);

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof message === 'string'
          ? message
          : (message as { message: string | string[] }).message,
    };

    // 에러 로깅
    const logMetadata = {
      method: request.method,
      url: request.url,
      statusCode: status,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      timestamp: errorResponse.timestamp,
    };

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, {
        ...logMetadata,
        error:
          exception instanceof Error
            ? {
                name: exception.name,
                message: exception.message,
                stack: exception.stack,
              }
            : JSON.stringify(exception),
      });
    } else {
      this.logger.warn(`${request.method} ${request.url}`, {
        ...logMetadata,
        errorResponse,
      });
    }

    response.status(status).json(errorResponse);
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (this.isStatusCodeError(exception)) {
      return this.sanitizeStatusCode(exception.statusCode);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }

    if (this.isStatusCodeError(exception)) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private sanitizeStatusCode(statusCode: number): number {
    if (
      Number.isInteger(statusCode) &&
      statusCode >= 400 &&
      statusCode <= 599
    ) {
      return statusCode;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private isStatusCodeError(exception: unknown): exception is StatusCodeError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'statusCode' in exception &&
      'message' in exception &&
      typeof exception.statusCode === 'number' &&
      typeof exception.message === 'string'
    );
  }
}
