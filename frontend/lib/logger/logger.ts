import pino from 'pino';
import { loggerConfig } from './logger.config';

// 서버 사이드 Logger (API Routes, Server Components)
export const logger = pino(loggerConfig);

// 로그 헬퍼 함수들
export const logInfo = (message: string, metadata?: Record<string, any>) => {
  logger.info(metadata || {}, message);
};

export const logError = (message: string, error?: Error | unknown, metadata?: Record<string, any>) => {
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

export const logWarn = (message: string, metadata?: Record<string, any>) => {
  logger.warn(metadata || {}, message);
};

export const logDebug = (message: string, metadata?: Record<string, any>) => {
  logger.debug(metadata || {}, message);
};

