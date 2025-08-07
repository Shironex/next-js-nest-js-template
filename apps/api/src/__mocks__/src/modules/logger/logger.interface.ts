// Mock for src/modules/logger/logger.interface
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  requestId?: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  [key: string]: any;
}

export interface LogMetadata {
  context?: string;
  timestamp?: string;
  level?: LogLevel;
  stack?: string;
  [key: string]: any;
}

export interface ILogger {
  error(message: string, error?: Error | any, context?: LogContext): void;
  warn(message: string, meta?: any, context?: LogContext): void;
  info(message: string, meta?: any, context?: LogContext): void;
  debug(message: string, meta?: any, context?: LogContext): void;
  setContext(context: string): void;
  getContext(): string;
}
