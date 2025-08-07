import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import {
  RateLimitService,
  RateLimitResult,
} from '../../modules/rate-limit/rate-limit.service';
import { CustomLogger } from '../../modules/logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let rateLimitService: DeepMockProxy<RateLimitService>;
  let reflector: DeepMockProxy<Reflector>;
  let logger: DeepMockProxy<CustomLogger>;

  const mockRequest = {
    ip: '127.0.0.1',
    path: '/auth/login',
    method: 'POST',
    route: { path: '/auth/login' },
    get: jest.fn(),
    connection: { remoteAddress: '127.0.0.1' },
  } as any;

  const mockResponse = {
    setHeader: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn(() => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    })),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitGuard,
        {
          provide: RateLimitService,
          useValue: mockDeep<RateLimitService>(),
        },
        {
          provide: Reflector,
          useValue: mockDeep<Reflector>(),
        },
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
      ],
    }).compile();

    guard = module.get<RateLimitGuard>(RateLimitGuard);
    rateLimitService = module.get(RateLimitService);
    reflector = module.get(Reflector);
    logger = module.get(CustomLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow request when no rate limit metadata is present', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(rateLimitService.checkRateLimit).not.toHaveBeenCalled();
    });

    it('should allow request when within rate limit', async () => {
      const rateLimitOptions = { requests: 10, window: '1m' };
      const rateLimitResult: RateLimitResult = {
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
        totalHits: 5,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockResolvedValue(rateLimitResult);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:127.0.0.1:/auth/login'),
        rateLimitOptions,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        10,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        5,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'Rate limit check passed',
        expect.objectContaining({
          remaining: 5,
          totalHits: 5,
          limit: 10,
        }),
      );
    });

    it('should deny request when rate limit exceeded', async () => {
      const rateLimitOptions = { requests: 10, window: '1m' };
      const rateLimitResult: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        totalHits: 15,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockResolvedValue(rateLimitResult);
      mockRequest.get.mockReturnValue('test-user-agent');

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        HttpException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Rate limit exceeded',
        expect.objectContaining({
          ip: '127.0.0.1',
          userAgent: 'test-user-agent',
          path: '/auth/login',
          method: 'POST',
          totalHits: 15,
          limit: 10,
          window: '1m',
        }),
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        0,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Retry-After',
        expect.any(Number),
      );
    });

    it('should set correct rate limit headers', async () => {
      const rateLimitOptions = { requests: 100, window: '1h' };
      const resetTime = Date.now() + 3600000;
      const rateLimitResult: RateLimitResult = {
        allowed: true,
        remaining: 50,
        resetTime,
        totalHits: 50,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockResolvedValue(rateLimitResult);

      await guard.canActivate(mockExecutionContext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        100,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        50,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        Math.ceil(resetTime / 1000),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Window',
        '1h',
      );
    });

    it('should handle custom key generator', async () => {
      const customKeyGenerator = jest.fn().mockReturnValue('custom-key');
      const rateLimitOptions = {
        requests: 5,
        window: '5m',
        keyGenerator: customKeyGenerator,
      };
      const rateLimitResult: RateLimitResult = {
        allowed: true,
        remaining: 3,
        resetTime: Date.now() + 300000,
        totalHits: 2,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockResolvedValue(rateLimitResult);

      await guard.canActivate(mockExecutionContext);

      expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest);
      expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(
        'custom-key',
        rateLimitOptions,
      );
    });

    it('should fail open when rate limit service throws error', async () => {
      const rateLimitOptions = { requests: 10, window: '1m' };
      const error = new Error('Redis connection failed');

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockRejectedValue(error);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        'Rate limit check failed',
        error,
        expect.objectContaining({
          path: '/auth/login',
          method: 'POST',
        }),
      );
    });

    it('should re-throw HttpException errors', async () => {
      const rateLimitOptions = { requests: 10, window: '1m' };
      const httpException = new HttpException(
        'Custom error',
        HttpStatus.BAD_REQUEST,
      );

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.checkRateLimit.mockRejectedValue(httpException);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        httpException,
      );
    });
  });

  describe('generateKey', () => {
    it('should generate default key with IP and path', () => {
      const key = guard['generateKey'](mockRequest as any, {
        requests: 10,
        window: '1m',
      });
      expect(key).toBe('rate_limit:127.0.0.1:/auth/login');
    });

    it('should use custom key generator when provided', () => {
      const customKeyGenerator = jest.fn().mockReturnValue('user:123:action');
      const options = {
        requests: 10,
        window: '1m',
        keyGenerator: customKeyGenerator,
      };

      const key = guard['generateKey'](mockRequest as any, options);

      expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest);
      expect(key).toBe('user:123:action');
    });

    it('should handle missing IP address', () => {
      const requestWithoutIp = {
        ...mockRequest,
        ip: undefined,
        connection: { remoteAddress: undefined },
      };

      const key = guard['generateKey'](requestWithoutIp as any, {
        requests: 10,
        window: '1m',
      });
      expect(key).toBe('rate_limit:unknown:/auth/login');
    });

    it('should use connection.remoteAddress as fallback', () => {
      const requestWithConnectionIp = {
        ...mockRequest,
        ip: undefined,
        socket: { remoteAddress: '192.168.1.1' },
      };

      const key = guard['generateKey'](requestWithConnectionIp as any, {
        requests: 10,
        window: '1m',
      });
      expect(key).toBe('rate_limit:192.168.1.1:/auth/login');
    });

    it('should handle missing route path', () => {
      const requestWithoutRoute = {
        ...mockRequest,
        route: undefined,
        path: '/fallback/path',
      };

      const key = guard['generateKey'](requestWithoutRoute as any, {
        requests: 10,
        window: '1m',
      });
      expect(key).toBe('rate_limit:127.0.0.1:/fallback/path');
    });
  });

  describe('setRateLimitHeaders', () => {
    it('should set all required headers', () => {
      const result = {
        remaining: 25,
        resetTime: 1640995200000, // Fixed timestamp
        totalHits: 75,
      };
      const options = { requests: 100, window: '1h' };

      guard['setRateLimitHeaders'](mockResponse as any, result, options);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        100,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        25,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        1640995200,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Window',
        '1h',
      );
    });

    it('should set Retry-After header when limit exceeded', () => {
      const futureResetTime = Date.now() + 30000; // 30 seconds from now
      const result = {
        remaining: -5,
        resetTime: futureResetTime,
        totalHits: 105,
      };
      const options = { requests: 100, window: '1m' };

      guard['setRateLimitHeaders'](mockResponse as any, result, options);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        0,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Retry-After',
        expect.any(Number),
      );
    });

    it('should not set Retry-After header when requests remain', () => {
      const result = {
        remaining: 10,
        resetTime: Date.now() + 60000,
        totalHits: 90,
      };
      const options = { requests: 100, window: '1m' };

      guard['setRateLimitHeaders'](mockResponse as any, result, options);

      expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
        'Retry-After',
        expect.any(Number),
      );
    });
  });
});
