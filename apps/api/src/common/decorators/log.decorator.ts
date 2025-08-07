import { SetMetadata, applyDecorators } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

export const LOG_METADATA = 'log_metadata';

/**
 * Configuration options for the LogRequest decorator
 */
export interface LogOptions {
  /** Whether to log incoming requests. Default: true */
  logRequest?: boolean;
  /** Whether to log outgoing responses. Default: true */
  logResponse?: boolean;
  /** Whether to log request/response body content. Default: false */
  logBody?: boolean;
  /** Whether to log request headers. Default: false */
  logHeaders?: boolean;
  /** Array of field names to exclude from logging (for security). Default: ['password', 'token', 'authorization'] */
  excludeFields?: string[];
  /** Custom context name for logs. If not provided, uses the controller class name */
  context?: string;
}

/**
 * Decorator that enables automatic HTTP request/response logging for controller methods.
 *
 * This decorator uses an interceptor to automatically log incoming requests and outgoing responses
 * with configurable options for what data to include. It provides request correlation via unique
 * request IDs and can exclude sensitive fields for security.
 *
 * @param options - Configuration options for logging behavior
 *
 * @example
 * ```typescript
 * // Basic usage - logs requests and responses
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   @LogRequest()
 *   async getUsers() {
 *     return this.userService.findAll();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with custom options
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @LogRequest({
 *     logRequest: true,
 *     logResponse: true,
 *     logBody: true,
 *     logHeaders: false,
 *     excludeFields: ['password', 'token', 'secret'],
 *     context: 'Authentication'
 *   })
 *   async login(@Body() loginDto: LoginDto) {
 *     return this.authService.login(loginDto);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Minimal logging - only log errors
 * @Controller('internal')
 * export class InternalController {
 *   @Post('webhook')
 *   @LogRequest({
 *     logRequest: false,
 *     logResponse: false
 *   })
 *   async handleWebhook(@Body() payload: any) {
 *     // Only errors will be logged, not normal request/response flow
 *     return this.webhookService.process(payload);
 *   }
 * }
 * ```
 *
 * @features
 * - Automatic request/response logging with timing
 * - Request correlation via unique request IDs
 * - Configurable data inclusion (body, headers, etc.)
 * - Security field exclusion for sensitive data
 * - Error handling with full stack traces
 * - Performance metrics (response time, status codes)
 * - Custom context naming for better log organization
 *
 * @security
 * By default, excludes common sensitive fields like 'password', 'token', and 'authorization'.
 * Always review and customize the excludeFields array for your specific use case.
 *
 * @performance
 * Minimal performance impact. Request/response data is only processed when logging is enabled.
 * Uses efficient JSON serialization with circular reference handling.
 */
export const LogRequest = (options: LogOptions = {}) => {
  const defaultOptions: LogOptions = {
    logRequest: true,
    logResponse: true,
    logBody: false,
    logHeaders: false,
    excludeFields: ['password', 'token', 'authorization'],
    ...options,
  };

  return applyDecorators(
    SetMetadata(LOG_METADATA, defaultOptions),
    UseInterceptors(LoggingInterceptor),
  );
};
