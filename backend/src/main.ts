import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// 환경 변수 파일 직접 로드 (ConfigModule보다 먼저 실행)
const envFile = existsSync(resolve(process.cwd(), '.env.development'))
  ? resolve(process.cwd(), '.env.development')
  : existsSync(resolve(process.cwd(), '.env.production'))
  ? resolve(process.cwd(), '.env.production')
  : resolve(process.cwd(), '.env');

if (existsSync(envFile)) {
  config({ path: envFile });
  console.log(`✅ 환경 변수 파일 로드: ${envFile}`);
} else {
  console.warn(`⚠️ 환경 변수 파일을 찾을 수 없습니다: ${envFile}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 환경 변수 로드 확인 (디버깅용)
  const configService = app.get(ConfigService);
  const botToken = configService.get<string>('SLACK_BOT_TOKEN') || process.env.SLACK_BOT_TOKEN;
  const channel = configService.get<string>('SLACK_CHANNEL') || process.env.SLACK_CHANNEL;
  console.log('📋 환경 변수 로드 확인:');
  console.log(`  SLACK_BOT_TOKEN: ${botToken ? '✅ 설정됨 (' + botToken.substring(0, 10) + '...)' : '❌ 없음'}`);
  console.log(`  SLACK_CHANNEL: "${channel || '❌ 없음'}"`);

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();

