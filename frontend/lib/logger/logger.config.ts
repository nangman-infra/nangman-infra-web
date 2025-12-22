import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Next.js 빌드 시 thread-stream 문제를 피하기 위해 transport를 런타임에만 설정
// 빌드 타임에는 transport를 사용하지 않음
export const loggerConfig: pino.LoggerOptions = {
  level: isDevelopment ? 'debug' : 'warn',
  // 운영 환경에서는 transport를 사용하지 않음 (JSON 출력)
  // 개발 환경에서만 pino-pretty 사용 (런타임에 동적 로드)
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

