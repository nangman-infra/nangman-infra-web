import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, context, message, ...metadata }) => {
                let log = `${timestamp} [${level}]`;
                if (context) {
                  log += ` [${context}]`;
                }
                log += ` ${message}`;
                if (Object.keys(metadata).length > 0) {
                  log += ` ${JSON.stringify(metadata)}`;
                }
                return log;
              },
            ),
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
    }),
  ],
  level: isDevelopment ? 'debug' : 'warn',
};
