import pino from 'pino';
import { loggerConfig } from './logger.config';

function createLogger(): pino.Logger {
  if (typeof globalThis.window === 'undefined') {
    try {
      return pino(loggerConfig);
    } catch {
      return pino({
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
        timestamp: pino.stdTimeFunctions.isoTime,
      });
    }
  }

  return pino({
    level: 'silent',
  });
}

export const logger = createLogger();

// 로그 헬퍼 함수들
export const logInfo = (message: string, metadata?: Record<string, unknown>) => {
  logger.info(metadata || {}, message);
};

export const logError = (message: string, error?: unknown, metadata?: Record<string, unknown>) => {
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
