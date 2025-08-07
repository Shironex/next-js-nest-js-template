import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { CustomLogger } from '../../modules/logger/logger.service';
import { LogOptions } from '../decorators/log.decorator';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: jest.Mocked<CustomLogger>;
  let reflector: jest.Mocked<Reflector>;
  let executionContext: jest.Mocked<ExecutionContext>;
  let callHandler: jest.Mocked<CallHandler>;

  const mockRequest = {
    method: 'GET',
    url: '/test',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'test-agent',
      authorization: 'Bearer secret-token',
    } as Record<string, string | undefined>,
    body: {
      username: 'testuser',
      password: 'secret123',
    },
  };

  const mockResponse = {
    statusCode: 200,
    setHeader: jest.fn(),
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: CustomLogger,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    logger = module.get(CustomLogger);
    reflector = module.get(Reflector);

    executionContext = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      getHandler: jest.fn(),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
    } as any;

    callHandler = {
      handle: jest.fn(),
    } as jest.Mocked<CallHandler>;

    // Reset mocks
    jest.clearAllMocks();
    mockRequest.headers = {
      'user-agent': 'test-agent',
      authorization: 'Bearer secret-token',
    };
    delete (mockRequest.headers as any)['x-request-id'];
  });

  describe('intercept', () => {
    it('should pass through when no log options are present', (done) => {
      // Arrange
      reflector.get.mockReturnValue(undefined);
      const testData = { result: 'test' };
      callHandler.handle.mockReturnValue(of(testData));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(testData);
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.error).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should log request and response with default options', (done) => {
      // Arrange
      const logOptions: LogOptions = {
        logRequest: true,
        logResponse: true,
        logBody: false,
        logHeaders: false,
        excludeFields: ['password', 'token', 'authorization'],
      };
      reflector.get.mockReturnValue(logOptions);
      const testData = { result: 'test' };
      callHandler.handle.mockReturnValue(of(testData));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: (data) => {
          expect(data).toEqual(testData);
          expect(logger.info).toHaveBeenCalledTimes(2);

          // Check request log
          expect(logger.info).toHaveBeenNthCalledWith(
            1,
            'Incoming GET /test',
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              ip: '127.0.0.1',
              userAgent: 'test-agent',
              context: 'TestController',
              requestId: expect.any(String),
            }),
          );

          // Check response log
          expect(logger.info).toHaveBeenNthCalledWith(
            2,
            expect.stringMatching(/^Completed GET \/test 200 - \d+ms$/),
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              statusCode: 200,
              responseTime: expect.any(Number),
              requestId: expect.any(String),
            }),
          );

          done();
        },
      });
    });

    it('should generate and set request ID when not present', (done) => {
      // Arrange
      const logOptions: LogOptions = { logRequest: true };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(mockRequest.headers['x-request-id']).toBeDefined();
          expect(typeof mockRequest.headers['x-request-id']).toBe('string');
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-request-id',
            mockRequest.headers['x-request-id'],
          );
          done();
        },
      });
    });

    it('should use existing request ID when present', (done) => {
      // Arrange
      const existingRequestId = 'existing-request-id';
      mockRequest.headers['x-request-id'] = existingRequestId;
      const logOptions: LogOptions = { logRequest: true };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(mockRequest.headers['x-request-id']).toBe(existingRequestId);
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'x-request-id',
            existingRequestId,
          );
          done();
        },
      });
    });

    it('should log headers when logHeaders is true', (done) => {
      // Arrange
      const logOptions: LogOptions = {
        logRequest: true,
        logHeaders: true,
        excludeFields: ['authorization'],
      };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              headers: expect.objectContaining({
                'user-agent': 'test-agent',
                authorization: '[REDACTED]',
              }),
            }),
          );
          done();
        },
      });
    });

    it('should log request body when logBody is true', (done) => {
      // Arrange
      const logOptions: LogOptions = {
        logRequest: true,
        logBody: true,
        excludeFields: ['password'],
      };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              body: expect.objectContaining({
                username: 'testuser',
                password: '[REDACTED]',
              }),
            }),
          );
          done();
        },
      });
    });

    it('should log response body when logBody is true', (done) => {
      // Arrange
      const logOptions: LogOptions = {
        logResponse: true,
        logBody: true,
        excludeFields: ['secret'],
      };
      reflector.get.mockReturnValue(logOptions);
      const responseData = { message: 'success', secret: 'hidden' };
      callHandler.handle.mockReturnValue(of(responseData));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            expect.stringMatching(/^Completed GET \/test 200 - \d+ms$/),
            expect.objectContaining({
              responseBody: expect.objectContaining({
                message: 'success',
                secret: '[REDACTED]',
              }),
            }),
          );
          done();
        },
      });
    });

    it('should log error when handler throws', (done) => {
      // Arrange
      const logOptions: LogOptions = { logRequest: true };
      reflector.get.mockReturnValue(logOptions);
      const error = new Error('Test error');
      (error as any).status = 500;
      callHandler.handle.mockReturnValue(throwError(() => error));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(logger.error).toHaveBeenCalledWith(
            expect.stringMatching(/^Failed GET \/test 500 - \d+ms$/),
            error,
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              statusCode: 500,
              responseTime: expect.any(Number),
            }),
          );
          done();
        },
      });
    });

    it('should use default status code 500 for errors without status', (done) => {
      // Arrange
      const logOptions: LogOptions = { logRequest: true };
      reflector.get.mockReturnValue(logOptions);
      const error = new Error('Test error');
      callHandler.handle.mockReturnValue(throwError(() => error));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        error: () => {
          expect(logger.error).toHaveBeenCalledWith(
            expect.stringMatching(/^Failed GET \/test 500 - \d+ms$/),
            error,
            expect.objectContaining({
              statusCode: 500,
            }),
          );
          done();
        },
      });
    });

    it('should use custom context when provided', (done) => {
      // Arrange
      const logOptions: LogOptions = {
        logRequest: true,
        context: 'CustomContext',
      };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              context: 'CustomContext',
            }),
          );
          done();
        },
      });
    });

    it('should handle unknown user agent', (done) => {
      // Arrange
      delete mockRequest.headers['user-agent'];
      const logOptions: LogOptions = { logRequest: true };
      reflector.get.mockReturnValue(logOptions);
      callHandler.handle.mockReturnValue(of({}));

      // Act
      const result$ = interceptor.intercept(executionContext, callHandler);

      // Assert
      result$.subscribe({
        next: () => {
          expect(logger.info).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              userAgent: 'Unknown',
            }),
          );
          done();
        },
      });
    });
  });

  describe('sanitizeObject', () => {
    it('should return non-objects as-is', () => {
      const result = (interceptor as any).sanitizeObject('test string', [
        'field',
      ]);
      expect(result).toBe('test string');
    });

    it('should return null/undefined as-is', () => {
      expect((interceptor as any).sanitizeObject(null, ['field'])).toBeNull();
      expect(
        (interceptor as any).sanitizeObject(undefined, ['field']),
      ).toBeUndefined();
    });

    it('should redact specified fields', () => {
      const obj = {
        public: 'visible',
        password: 'secret123',
        token: 'abc123',
        other: 'data',
      };

      const result = (interceptor as any).sanitizeObject(obj, [
        'password',
        'token',
      ]);

      expect(result).toEqual({
        public: 'visible',
        password: '[REDACTED]',
        token: '[REDACTED]',
        other: 'data',
      });
    });

    it('should handle empty exclude fields array', () => {
      const obj = { field: 'value' };
      const result = (interceptor as any).sanitizeObject(obj, []);
      expect(result).toEqual(obj);
    });

    it('should not modify original object', () => {
      const obj = { password: 'secret' };
      const result = (interceptor as any).sanitizeObject(obj, ['password']);

      expect(obj.password).toBe('secret');
      expect(result.password).toBe('[REDACTED]');
    });
  });
});
