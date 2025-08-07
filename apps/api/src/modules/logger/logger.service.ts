import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ILogger, LogContext, LogLevel } from './logger.interface';
import { consoleFormatter } from './formatters/console.formatter';
import { fileFormatter } from './formatters/file.formatter';
import loggerConfig from '../../config/logger.config';

@Injectable()
export class CustomLogger implements ILogger, LoggerService {
  private readonly winston: winston.Logger;
  private context: string = 'Application';

  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
  ) {
    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport
    if (this.config.consoleEnabled) {
      transports.push(
        new winston.transports.Console({
          format: consoleFormatter,
          level: this.config.level,
        }),
      );
    }

    // File transport with rotation
    if (this.config.fileEnabled) {
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: `${this.config.filePath}/application-%DATE%.log`,
          datePattern: this.config.datePattern,
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          format: fileFormatter,
          level: this.config.level,
        }),
      );

      // Separate error log file
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: `${this.config.filePath}/error-%DATE%.log`,
          datePattern: this.config.datePattern,
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          format: fileFormatter,
          level: 'error',
        }),
      );
    }

    return winston.createLogger({
      level: this.config.level,
      transports,
      exitOnError: false,
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  getContext(): string {
    return this.context;
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    const meta = this.buildMeta('error', error, context);
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any, context?: LogContext): void {
    const logMeta = this.buildMeta('warn', meta, context);
    this.winston.warn(message, logMeta);
  }

  info(message: string, meta?: any, context?: LogContext): void {
    const logMeta = this.buildMeta('info', meta, context);
    this.winston.info(message, logMeta);
  }

  debug(message: string, meta?: any, context?: LogContext): void {
    const logMeta = this.buildMeta('debug', meta, context);
    this.winston.debug(message, logMeta);
  }

  // NestJS LoggerService compatibility
  log(message: string, context?: string): void {
    this.info(message, {}, { context: context || this.context });
  }

  verbose(message: string, context?: string): void {
    this.debug(message, {}, { context: context || this.context });
  }

  private buildMeta(level: LogLevel, meta?: any, context?: LogContext): any {
    const logMeta: any = {
      context: context?.context || this.context,
      level,
      ...context,
    };

    if (meta) {
      if (meta instanceof Error) {
        logMeta.error = {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
        };
        logMeta.stack = meta.stack;
      } else if (typeof meta === 'object') {
        Object.assign(logMeta, meta);
      } else {
        logMeta.data = meta;
      }
    }

    return logMeta;
  }

  // Utility methods for common logging patterns
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ): void {
    this.info(
      `${method} ${url} ${statusCode} - ${responseTime}ms`,
      {},
      {
        method,
        url,
        statusCode,
        responseTime,
        ...context,
      },
    );
  }

  logError(error: Error, context?: string, additionalMeta?: any): void {
    const originalContext = this.context;
    const tempContext = context || 'Error';

    // Temporarily change context for this log entry only
    this.context = tempContext;
    this.error(error.message, error, additionalMeta);

    // Restore original context
    this.context = originalContext;
  }

  logDatabaseQuery(
    query: string,
    duration: number,
    context?: LogContext,
  ): void {
    this.debug(`Database Query - ${duration}ms`, { query, duration }, context);
  }
}
