import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CustomLogger } from './logger.service';
import loggerConfig from '../../config/logger.config';
import { ILogger, LogContext } from './logger.interface';

@Injectable()
export class ContextBoundLogger implements ILogger {
  constructor(
    private readonly baseLogger: CustomLogger,
    private readonly context: string,
  ) {}

  error(message: string, error?: Error | any, context?: LogContext): void {
    this.baseLogger.error(message, error, {
      ...context,
      context: this.context,
    });
  }

  warn(message: string, meta?: any, context?: LogContext): void {
    this.baseLogger.warn(message, meta, { ...context, context: this.context });
  }

  info(message: string, meta?: any, context?: LogContext): void {
    this.baseLogger.info(message, meta, { ...context, context: this.context });
  }

  debug(message: string, meta?: any, context?: LogContext): void {
    this.baseLogger.debug(message, meta, { ...context, context: this.context });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContext(_context: string): void {
    // This method exists for compatibility but doesn't change the bound context
    // The context is immutable once the logger is created
  }

  getContext(): string {
    return this.context;
  }

  // Utility methods for common logging patterns
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ): void {
    this.baseLogger.logRequest(method, url, statusCode, responseTime, {
      ...context,
      context: this.context,
    });
  }

  logError(error: Error, _context?: string, additionalMeta?: any): void {
    // Use the bound context instead of the provided context parameter
    this.baseLogger.logError(error, this.context, additionalMeta);
  }

  logDatabaseQuery(
    query: string,
    duration: number,
    context?: LogContext,
  ): void {
    this.baseLogger.logDatabaseQuery(query, duration, {
      ...context,
      context: this.context,
    });
  }
}

@Injectable()
export class LoggerFactory {
  constructor(
    @Inject(loggerConfig.KEY)
    private readonly config: ConfigType<typeof loggerConfig>,
    private readonly baseLogger: CustomLogger,
  ) {}

  /**
   * Creates a context-bound logger instance that automatically applies
   * the specified context to all log messages
   */
  createLogger(context: string): ContextBoundLogger {
    return new ContextBoundLogger(this.baseLogger, context);
  }

  /**
   * Get the base logger instance (for cases where you need the singleton)
   */
  getBaseLogger(): CustomLogger {
    return this.baseLogger;
  }
}
