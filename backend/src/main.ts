import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import {
  DEFAULT_FRONTEND_URL,
  DEFAULT_BACKEND_PORT,
} from './common/constants/app';

// 환경 변수 파일 직접 로드 (ConfigModule보다 먼저 실행)
const envFile = existsSync(resolve(process.cwd(), '.env.development'))
  ? resolve(process.cwd(), '.env.development')
  : existsSync(resolve(process.cwd(), '.env.production'))
    ? resolve(process.cwd(), '.env.production')
    : resolve(process.cwd(), '.env');

if (existsSync(envFile)) {
  config({ path: envFile });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston Logger를 NestJS 기본 Logger로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  // 환경 변수 로드 확인 (디버깅용)
  const configService = app.get(ConfigService);
  const webhookUrl =
    configService.get<string>('MATTERMOST_WEBHOOK_URL') ||
    process.env.MATTERMOST_WEBHOOK_URL;

  logger.log('환경 변수 파일 로드', { envFile });
  logger.debug('환경 변수 로드 확인', {
    hasWebhookUrl: !!webhookUrl,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 설정 (프론트엔드와의 통신을 위해)
  app.enableCors({
    origin: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
    credentials: true,
  });

  const port = process.env.PORT || DEFAULT_BACKEND_PORT;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, { port });
}

bootstrap();
