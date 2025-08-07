import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import {
  RateLimitService,
  RateLimitOptions,
} from '../../modules/rate-limit/rate-limit.service';
import { RATE_LIMIT_METADATA } from '../decorators/rate-limit.decorator';
import { CustomLogger } from '../../modules/logger/logger.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RateLimitGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate rate limit key
    const key = this.generateKey(request, rateLimitOptions);

    try {
      const result = await this.rateLimitService.checkRateLimit(
        key,
        rateLimitOptions,
      );

      // Set rate limit headers
      this.setRateLimitHeaders(response, result, rateLimitOptions);

      if (!result.allowed) {
        this.logger.warn('Rate limit exceeded', {
          key,
          ip: request.ip,
          userAgent: request.get('user-agent'),
          path: request.path,
          method: request.method,
          totalHits: result.totalHits,
          limit: rateLimitOptions.requests,
          window: rateLimitOptions.window,
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests',
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.logger.debug('Rate limit check passed', {
        key,
        remaining: result.remaining,
        totalHits: result.totalHits,
        limit: rateLimitOptions.requests,
      });

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Rate limit check failed', error, {
        key,
        path: request.path,
        method: request.method,
      });

      // Fail open - allow request if rate limiting fails
      return true;
    }
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation based on IP and path
    const ip = request?.ip || request.socket?.remoteAddress || 'unknown';
    const path = request.route?.path || request.path;
    return `rate_limit:${ip}:${path}`;
  }

  private setRateLimitHeaders(
    response: Response,
    result: { remaining: number; resetTime: number; totalHits: number },
    options: RateLimitOptions,
  ): void {
    response.setHeader('X-RateLimit-Limit', options.requests);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
    response.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    response.setHeader('X-RateLimit-Window', options.window);

    if (result.remaining <= 0) {
      response.setHeader(
        'Retry-After',
        Math.ceil((result.resetTime - Date.now()) / 1000),
      );
    }
  }
}
