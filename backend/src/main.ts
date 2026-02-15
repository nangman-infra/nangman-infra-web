import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  DEFAULT_FRONTEND_URL,
  DEFAULT_BACKEND_PORT,
} from './common/constants/app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston Logger를 NestJS 기본 Logger로 설정
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  const configService = app.get(ConfigService);
  const webhookUrl = configService.get<string>('MATTERMOST_WEBHOOK_URL');
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || DEFAULT_FRONTEND_URL;
  const port =
    Number(configService.get<string>('PORT')) || DEFAULT_BACKEND_PORT;

  logger.log('애플리케이션 설정 로드 완료', {
    nodeEnv: configService.get<string>('NODE_ENV') || process.env.NODE_ENV,
    hasWebhookUrl: !!webhookUrl,
    port,
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
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`, { port });
}

bootstrap();
