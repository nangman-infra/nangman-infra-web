import pino from 'pino';
import { loggerConfig } from './logger.config';

// 서버 사이드 Logger (API Routes, Server Components)
// Next.js 빌드 시 thread-stream 문제를 피하기 위해 런타임에만 transport 로드
let logger: pino.Logger;

if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  try {
    logger = pino(loggerConfig);
  } catch {
    // 빌드 타임 에러 방지를 위한 fallback
    logger = pino({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }
} else {
  // 클라이언트 사이드에서는 사용하지 않음 (logger.client.ts 사용)
  logger = pino({
    level: 'silent',
  });
}

export { logger };

// 로그 헬퍼 함수들
export const logInfo = (message: string, metadata?: Record<string, unknown>) => {
  logger.info(metadata || {}, message);
};

export const logError = (message: string, error?: Error | unknown, metadata?: Record<string, unknown>) => {
  if (error instanceof Error) {
    logger.error(
      {
        ...metadata,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      message,
    );
  } else {
    logger.error(metadata || {}, message);
  }
};

export const logWarn = (message: string, metadata?: Record<string, unknown>) => {
  logger.warn(metadata || {}, message);
};

export const logDebug = (message: string, metadata?: Record<string, unknown>) => {
  logger.debug(metadata || {}, message);
};

