import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

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
}
