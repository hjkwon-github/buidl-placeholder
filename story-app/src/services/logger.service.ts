import winston from 'winston';

/**
 * 로거 서비스 클래스
 */
export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.sp
        lat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'story-api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => {
              const { timestamp, level, message, ...rest } = info;
              return `${timestamp} ${level}: ${message} ${
                Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
              }`;
            })
          )
        })
      ]
    });
  }

  /**
   * 디버그 레벨 로그
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /**
   * 정보 레벨 로그
   */
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  /**
   * 경고 레벨 로그
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  /**
   * 에러 레벨 로그
   */
  error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }
} 