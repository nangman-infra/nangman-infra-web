// 클라이언트 사이드 Logger (브라우저)
const isDevelopment = process.env.NODE_ENV === 'development';

interface LogMetadata {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string | number | Date;
  level: string;
  message?: string;
  context?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  [key: string]: unknown;
}

const createStructuredLog = (
  level: string,
  message: string,
  metadata?: LogMetadata,
  error?: Error,
): LogEntry => {
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };

  if (error) {
    log.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return log;
};

const formatLog = (log: LogEntry): string => {
  if (isDevelopment) {
    // 개발 환경: 읽기 쉬운 포맷
    const timestamp = new Date(log.timestamp as string | number | Date).toLocaleTimeString();
    const level = (log.level || '').toUpperCase().padEnd(5);
    const context = log.context ? `[${log.context}]` : '';
    let output = `${timestamp} [${level}]${context} ${log.message || ''}`;
    
    if (log.error) {
      const error = log.error as { name?: string; message?: string; stack?: string };
      output += `\n  Error: ${error.name || 'Unknown'}: ${error.message || 'Unknown error'}`;
      if (error.stack) {
        output += `\n  ${error.stack}`;
      }
    }
    
    const metadataKeys = Object.keys(log).filter(
      (key) => !['timestamp', 'level', 'message', 'error'].includes(key),
    );
    if (metadataKeys.length > 0) {
      output += `\n  ${JSON.stringify(
        Object.fromEntries(metadataKeys.map((key) => [key, log[key]])),
        null,
        2,
      )}`;
    }
    
    return output;
  } else {
    // 운영 환경: JSON 포맷
    return JSON.stringify(log);
  }
};

export const logger = {
  info: (message: string, metadata?: LogMetadata) => {
    // 개발 환경에서만 info 레벨 출력
    if (isDevelopment) {
      const log = createStructuredLog('info', message, metadata);
      console.log(formatLog(log));
    }
  },

  error: (message: string, error?: Error | unknown, metadata?: LogMetadata) => {
    // 운영 환경에서도 error 레벨 출력
    const err = error instanceof Error ? error : undefined;
    const log = createStructuredLog('error', message, metadata, err);
    console.error(formatLog(log));
  },

  warn: (message: string, metadata?: LogMetadata) => {
    // 운영 환경에서도 warn 레벨 출력
    const log = createStructuredLog('warn', message, metadata);
    console.warn(formatLog(log));
  },

  debug: (message: string, metadata?: LogMetadata) => {
    // 개발 환경에서만 debug 레벨 출력
    if (isDevelopment) {
      const log = createStructuredLog('debug', message, metadata);
      console.debug(formatLog(log));
    }
  },
};

