import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ContactModule } from './modules/contact/contact.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { BlogModule } from './modules/blog/blog.module';
import { LoggerModule } from './common/logger/logger.module';
import {
  RATE_LIMIT_REQUESTS_PER_HOUR,
  RATE_LIMIT_TTL_MS,
} from './common/constants/rate-limiting';

function resolveEnvFilePriority(): string[] {
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    return ['.env.production', '.env'];
  }

  if (nodeEnv === 'test') {
    return ['.env.test', '.env'];
  }

  return ['.env.development', '.env'];
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePriority(),
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
