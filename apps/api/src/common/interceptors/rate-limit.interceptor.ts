import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RateLimitService } from '../../modules/rate-limit/rate-limit.service';
import {
  RATE_LIMIT_METADATA,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';
import { CustomLogger } from '../../modules/logger/logger.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(RateLimitInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!rateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate the same rate limit key as the guard
    const key = this.generateKey(request, rateLimitOptions);

    return next.handle().pipe(
      tap({
        next: () => {
          void this.handleResponse(key, response.statusCode, rateLimitOptions);
        },
        error: (error) => {
          // For error responses, check if we should skip failed requests
          const statusCode =
            error?.status || error?.response?.statusCode || 500;
          void this.handleResponse(key, statusCode, rateLimitOptions);
        },
      }),
    );
  }

  private async handleResponse(
    key: string,
    statusCode: number,
    options: RateLimitOptions,
  ): Promise<void> {
    try {
      let shouldSkip = false;

      // Check if we should skip successful requests (2xx status codes)
      if (
        options.skipSuccessfulRequests &&
        statusCode >= 200 &&
        statusCode < 300
      ) {
        shouldSkip = true;
        this.logger.debug(
          'Skipping rate limit increment for successful request',
          {
            key,
            statusCode,
            skipSuccessfulRequests: options.skipSuccessfulRequests,
          },
        );
      }

      // Check if we should skip failed requests (4xx/5xx status codes)
      if (options.skipFailedRequests && statusCode >= 400) {
        shouldSkip = true;
        this.logger.debug('Skipping rate limit increment for failed request', {
          key,
          statusCode,
          skipFailedRequests: options.skipFailedRequests,
        });
      }

      if (shouldSkip) {
        await this.rateLimitService.decrementRateLimit(key);
      }
    } catch (error) {
      this.logger.error('Failed to handle rate limit response', error, {
        key,
        statusCode,
      });
    }
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation based on IP and path (same as guard)
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const path = request.route?.path || request.path;
    return `rate_limit:${ip}:${path}`;
  }
}
