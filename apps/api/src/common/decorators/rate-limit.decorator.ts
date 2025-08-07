import {
  SetMetadata,
  applyDecorators,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { RateLimitInterceptor } from '../interceptors/rate-limit.interceptor';

export const RATE_LIMIT_METADATA = 'rate_limit_metadata';

/**
 * Configuration options for the RateLimit decorator
 */
export interface RateLimitOptions {
  /** Number of requests allowed within the window. Default: 100 */
  requests: number;
  /** Time window for rate limiting (e.g., '1m', '1h', '30s'). Default: '1m' */
  window: string;
  /**
   * Custom key generator function for rate limiting.
   * Default generates key based on IP address and request path.
   *
   * @param req - Express request object
   * @returns string - Unique key for rate limiting
   */
  keyGenerator?: (req: any) => string;
  /** Whether to skip rate limiting for successful requests (2xx status). Default: false */
  skipSuccessfulRequests?: boolean;
  /** Whether to skip rate limiting for failed requests (4xx/5xx status). Default: false */
  skipFailedRequests?: boolean;
}

/**
 * Decorator that applies rate limiting to controller methods or entire controllers.
 *
 * This decorator uses Redis-based sliding window rate limiting to track and limit
 * requests. It provides distributed rate limiting that works across multiple
 * application instances and includes comprehensive logging and monitoring.
 *
 * @param options - Configuration options for rate limiting behavior
 *
 * @example
 * ```typescript
 * // Basic usage - 10 requests per minute
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @RateLimit({ requests: 10, window: '1m' })
 *   async login(@Body() loginDto: LoginDto) {
 *     return this.authService.login(loginDto);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Controller-level rate limiting - applies to all endpoints
 * @Controller('api')
 * @RateLimit({ requests: 1000, window: '1h' })
 * export class ApiController {
 *   @Get('data')
 *   async getData() {
 *     return this.dataService.getData();
 *   }
 *
 *   @Post('upload')
 *   @RateLimit({ requests: 5, window: '10m' }) // Override controller limit
 *   async uploadFile() {
 *     return this.uploadService.handleUpload();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // User-based rate limiting using custom key generator
 * @Controller('user')
 * export class UserController {
 *   @Post('update-profile')
 *   @RateLimit({
 *     requests: 5,
 *     window: '15m',
 *     keyGenerator: (req) => `user:${req.user?.id || req.ip}:profile-update`
 *   })
 *   async updateProfile(@Body() updateDto: UpdateProfileDto) {
 *     return this.userService.updateProfile(updateDto);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Different limits for different endpoint patterns
 * @Controller('auth')
 * export class AuthController {
 *   @Post('register')
 *   @RateLimit({
 *     requests: 3,
 *     window: '1h',
 *     keyGenerator: (req) => `register:${req.ip}`
 *   })
 *   async register(@Body() dto: RegisterDto) {
 *     return this.authService.register(dto);
 *   }
 *
 *   @Post('login')
 *   @RateLimit({
 *     requests: 10,
 *     window: '15m',
 *     keyGenerator: (req) => `login:${req.ip}`
 *   })
 *   async login(@Body() dto: LoginDto) {
 *     return this.authService.login(dto);
 *   }
 *
 *   @Post('forgot-password')
 *   @RateLimit({
 *     requests: 2,
 *     window: '1h',
 *     keyGenerator: (req) => `forgot-pwd:${req.body?.email || req.ip}`
 *   })
 *   async forgotPassword(@Body() dto: ForgotPasswordDto) {
 *     return this.authService.forgotPassword(dto);
 *   }
 * }
 * ```
 *
 * @features
 * - Redis-based distributed rate limiting using sliding window algorithm
 * - Automatic HTTP headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.)
 * - Customizable key generation for user-based or custom rate limiting
 * - Graceful fallback when Redis is unavailable
 * - Comprehensive logging and monitoring integration
 * - Support for different time windows (seconds, minutes, hours, days)
 * - Method-level and controller-level application
 * - Proper error handling with 429 Too Many Requests response
 *
 * @headers
 * The decorator automatically sets the following HTTP headers:
 * - `X-RateLimit-Limit`: Maximum requests allowed in the window
 * - `X-RateLimit-Remaining`: Remaining requests in current window
 * - `X-RateLimit-Reset`: Unix timestamp when the window resets
 * - `X-RateLimit-Window`: The time window configuration
 * - `Retry-After`: Seconds to wait before retrying (when limit exceeded)
 *
 * @time-windows
 * Supported window formats:
 * - `'30s'` - 30 seconds
 * - `'5m'` - 5 minutes
 * - `'1h'` - 1 hour
 * - `'1d'` - 1 day
 *
 * @key-generation
 * Default key format: `rate_limit:{ip}:{path}`
 * Custom key examples:
 * - User-based: `rate_limit:user:{userId}:{action}`
 * - Email-based: `rate_limit:email:{email}:{action}`
 * - Global: `rate_limit:global:{action}`
 *
 * @error-handling
 * - Returns 429 Too Many Requests when limit exceeded
 * - Includes retry-after header with seconds to wait
 * - Logs rate limit violations for monitoring
 * - Fails open (allows requests) if Redis is unavailable
 *
 * @monitoring
 * All rate limit events are logged with context including:
 * - Request IP and user agent
 * - Request path and method
 * - Current hit count and limits
 * - Rate limit key for debugging
 */
export const RateLimit = (options: RateLimitOptions) => {
  const defaultOptions: RateLimitOptions = {
    ...options,
    requests: options.requests ?? 100,
    window: options.window ?? '1m',
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    skipFailedRequests: options.skipFailedRequests ?? false,
  };

  return applyDecorators(
    SetMetadata(RATE_LIMIT_METADATA, defaultOptions),
    UseGuards(RateLimitGuard),
    UseInterceptors(RateLimitInterceptor),
  );
};
