import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ContactModule } from './modules/contact/contact.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { BlogModule } from './modules/blog/blog.module';
import { LoggerModule } from './common/logger/logger.module';
import { existsSync } from 'fs';
import { resolve } from 'path';
import {
  RATE_LIMIT_REQUESTS_PER_HOUR,
  RATE_LIMIT_TTL_MS,
} from './common/constants/rate-limiting';

// 환경 변수 파일 경로 찾기
function findEnvFile(): string[] {
  const possiblePaths = [
    '.env.development',
    '.env.production',
    '.env',
    resolve(process.cwd(), '.env.development'),
    resolve(process.cwd(), '.env.production'),
    resolve(process.cwd(), '.env'),
  ];

  const foundPaths: string[] = [];
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      foundPaths.push(path);
    }
  }

  return foundPaths.length > 0 ? foundPaths : ['.env.development', '.env'];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: findEnvFile(),
      ignoreEnvFile: false,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: RATE_LIMIT_TTL_MS, // 1시간 (밀리초)
        limit: RATE_LIMIT_REQUESTS_PER_HOUR, // 1시간에 5회
      },
    ]),
    LoggerModule,
    ContactModule,
    MonitoringModule,
    BlogModule,
  ],
})
export class AppModule {}
