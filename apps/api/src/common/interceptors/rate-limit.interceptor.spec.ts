import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { RateLimitInterceptor } from './rate-limit.interceptor';
import { RateLimitService } from '../../modules/rate-limit/rate-limit.service';
import { CustomLogger } from '../../modules/logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import {
  RateLimitOptions,
  RATE_LIMIT_METADATA,
} from '../decorators/rate-limit.decorator';

describe('RateLimitInterceptor', () => {
  let interceptor: RateLimitInterceptor;
  let rateLimitService: DeepMockProxy<RateLimitService>;
  let reflector: DeepMockProxy<Reflector>;
  let logger: DeepMockProxy<CustomLogger>;
  let mockContext: DeepMockProxy<ExecutionContext>;
  let mockCallHandler: DeepMockProxy<CallHandler>;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitInterceptor,
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

    interceptor = module.get<RateLimitInterceptor>(RateLimitInterceptor);
    rateLimitService = module.get(RateLimitService);
    reflector = module.get(Reflector);
    logger = module.get(CustomLogger);

    // Setup mocks
    mockContext = mockDeep<ExecutionContext>();
    mockCallHandler = mockDeep<CallHandler>();

    mockRequest = {
      ip: '127.0.0.1',
      path: '/test',
      route: { path: '/test' },
      socket: { remoteAddress: '127.0.0.1' },
    };

    mockResponse = {
      statusCode: 200,
    };

    mockContext.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    } as any);

    mockCallHandler.handle.mockReturnValue(of('test result'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through when no rate limit options are present', (done) => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = interceptor.intercept(mockContext, mockCallHandler);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        RATE_LIMIT_METADATA,
        [mockContext.getHandler(), mockContext.getClass()],
      );

      result.subscribe({
        next: (value) => {
          expect(value).toBe('test result');
          expect(rateLimitService.decrementRateLimit).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle successful response without skipping', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: false,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockResponse.statusCode = 200;

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: (value) => {
          expect(value).toBe('test result');
          expect(rateLimitService.decrementRateLimit).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should skip successful requests when configured', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockResponse.statusCode = 201;

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: (value) => {
          expect(value).toBe('test result');

          // Give a small delay for the async handleResponse
          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'rate_limit:127.0.0.1:/test',
            );
            expect(logger.debug).toHaveBeenCalledWith(
              'Skipping rate limit increment for successful request',
              {
                key: 'rate_limit:127.0.0.1:/test',
                statusCode: 201,
                skipSuccessfulRequests: true,
              },
            );
            done();
          }, 10);
        },
      });
    });

    it('should skip failed requests when configured', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipFailedRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      const error = { status: 400 };
      mockCallHandler.handle.mockReturnValue(throwError(() => error));

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        error: (err) => {
          expect(err).toBe(error);

          // Give a small delay for the async handleResponse
          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'rate_limit:127.0.0.1:/test',
            );
            expect(logger.debug).toHaveBeenCalledWith(
              'Skipping rate limit increment for failed request',
              {
                key: 'rate_limit:127.0.0.1:/test',
                statusCode: 400,
                skipFailedRequests: true,
              },
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle error without status code', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipFailedRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      const error = new Error('Generic error');
      mockCallHandler.handle.mockReturnValue(throwError(() => error));

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        error: (err) => {
          expect(err).toBe(error);

          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'rate_limit:127.0.0.1:/test',
            );
            expect(logger.debug).toHaveBeenCalledWith(
              'Skipping rate limit increment for failed request',
              {
                key: 'rate_limit:127.0.0.1:/test',
                statusCode: 500,
                skipFailedRequests: true,
              },
            );
            done();
          }, 10);
        },
      });
    });

    it('should use custom key generator when provided', (done) => {
      const customKeyGenerator = jest.fn().mockReturnValue('custom:key');
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: true,
        keyGenerator: customKeyGenerator,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockResponse.statusCode = 200;

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: (value) => {
          expect(value).toBe('test result');
          expect(customKeyGenerator).toHaveBeenCalledWith(mockRequest);

          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'custom:key',
            );
            done();
          }, 10);
        },
      });
    });

    it('should use default key generation when no custom generator', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockRequest.ip = '192.168.1.1';
      mockRequest.route = { path: '/api/test' };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {
          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'rate_limit:192.168.1.1:/api/test',
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle missing IP and route gracefully', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockRequest.ip = undefined;
      mockRequest.socket = { remoteAddress: undefined };
      mockRequest.route = undefined;
      mockRequest.path = '/fallback';

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {
          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).toHaveBeenCalledWith(
              'rate_limit:unknown:/fallback',
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle rate limit service errors gracefully', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: true,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      rateLimitService.decrementRateLimit.mockRejectedValue(
        new Error('Redis error'),
      );

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: (value) => {
          expect(value).toBe('test result');

          setTimeout(() => {
            expect(logger.error).toHaveBeenCalledWith(
              'Failed to handle rate limit response',
              expect.any(Error),
              {
                key: 'rate_limit:127.0.0.1:/test',
                statusCode: 200,
              },
            );
            done();
          }, 10);
        },
      });
    });

    it('should not skip requests when both skip options are false', (done) => {
      const rateLimitOptions: RateLimitOptions = {
        requests: 10,
        window: '1m',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      };

      reflector.getAllAndOverride.mockReturnValue(rateLimitOptions);
      mockResponse.statusCode = 404;

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {
          setTimeout(() => {
            expect(rateLimitService.decrementRateLimit).not.toHaveBeenCalled();
            expect(logger.debug).not.toHaveBeenCalled();
            done();
          }, 10);
        },
      });
    });
  });
});
