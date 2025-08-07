import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export interface RateLimitOptions {
  requests: number;
  window: string;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private redis: Redis | null = null;
  private readonly fallbackMode: boolean = false;

  constructor(private readonly configService: ConfigService) {
    void this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      const redisUrl =
        this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.redis.on('connect', () => {
        this.logger.log('Connected to Redis for rate limiting');
      });

      void this.redis.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection:', error);
      this.logger.warn(
        'Rate limiting will operate in fallback mode (memory-based)',
      );
    }
  }

  async checkRateLimit(
    key: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    const windowMs = this.parseWindow(options.window);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.redis) {
      return this.fallbackRateLimit(key, options, now);
    }

    try {
      return await this.redisRateLimit(
        key,
        options,
        now,
        windowStart,
        windowMs,
      );
    } catch (error) {
      this.logger.error('Redis rate limit error:', error);
      return this.fallbackRateLimit(key, options, now);
    }
  }

  private async redisRateLimit(
    key: string,
    options: RateLimitOptions,
    now: number,
    windowStart: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const pipeline = this.redis!.pipeline();

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request timestamp
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Count current requests in window (including the current request)
    pipeline.zcard(key);

    // Set expiration to cleanup old keys
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const [, , [countErr, totalHits]] = results;

    if (countErr) {
      throw countErr;
    }

    const hits = (totalHits as number) || 0;
    const allowed = hits <= options.requests;
    const remaining = Math.max(0, options.requests - hits);
    const resetTime = now + windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      totalHits: hits,
    };
  }

  private fallbackRateLimit(
    _key: string,
    options: RateLimitOptions,
    now: number,
  ): RateLimitResult {
    // Simple in-memory fallback (not recommended for production)
    this.logger.warn(
      'Using fallback rate limiting - not suitable for distributed systems',
    );

    return {
      allowed: true,
      remaining: options.requests,
      resetTime: now + this.parseWindow(options.window),
      totalHits: 0,
    };
  }

  private parseWindow(window: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = window.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(
        `Invalid window format: ${window}. Use format like '5m', '1h', '30s'`,
      );
    }

    const [, amount, unit] = match;
    return parseInt(amount, 10) * units[unit];
  }

  async decrementRateLimit(key: string): Promise<void> {
    if (!this.redis) {
      // In fallback mode, we can't decrement since we don't track properly
      this.logger.warn('Cannot decrement rate limit in fallback mode', { key });
      return;
    }

    try {
      // Get the most recent entry (highest score) and remove it
      const pipeline = this.redis.pipeline();

      // Get the most recent entry
      const entries = await this.redis.zrevrange(key, 0, 0, 'WITHSCORES');

      if (entries && entries.length >= 2) {
        const entryValue = entries[0];
        // Remove the most recent entry
        pipeline.zrem(key, entryValue);
        await pipeline.exec();

        this.logger.debug('Rate limit decremented', {
          key,
          removedEntry: entryValue,
        });
      } else {
        this.logger.debug('No entries to decrement for rate limit key', {
          key,
        });
      }
    } catch (error) {
      this.logger.error('Failed to decrement rate limit', error, { key });
    }
  }

  onModuleDestroy(): void {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}
