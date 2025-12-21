import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './modules/contact/contact.module';
import { LoggerModule } from './common/logger/logger.module';
import { existsSync } from 'fs';
import { resolve } from 'path';

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
    LoggerModule,
    ContactModule,
  ],
})
export class AppModule {}

