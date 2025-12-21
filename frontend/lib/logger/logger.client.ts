// 클라이언트 사이드 Logger (브라우저)
const isDevelopment = process.env.NODE_ENV === 'development';

interface LogMetadata {
  [key: string]: any;
}

const createStructuredLog = (
  level: string,
  message: string,
  metadata?: LogMetadata,
  error?: Error,
) => {
  const log: any = {
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

const formatLog = (log: any): string => {
  if (isDevelopment) {
    // 개발 환경: 읽기 쉬운 포맷
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const level = log.level.toUpperCase().padEnd(5);
    const context = log.context ? `[${log.context}]` : '';
    let output = `${timestamp} [${level}]${context} ${log.message}`;
    
    if (log.error) {
      output += `\n  Error: ${log.error.name}: ${log.error.message}`;
      if (log.error.stack) {
        output += `\n  ${log.error.stack}`;
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
    const log = createStructuredLog('info', message, metadata);
    console.log(formatLog(log));
  },

  error: (message: string, error?: Error | unknown, metadata?: LogMetadata) => {
    const err = error instanceof Error ? error : undefined;
    const log = createStructuredLog('error', message, metadata, err);
    console.error(formatLog(log));
  },

  warn: (message: string, metadata?: LogMetadata) => {
    const log = createStructuredLog('warn', message, metadata);
    console.warn(formatLog(log));
  },

  debug: (message: string, metadata?: LogMetadata) => {
    if (isDevelopment) {
      const log = createStructuredLog('debug', message, metadata);
      console.debug(formatLog(log));
    }
  },
};

