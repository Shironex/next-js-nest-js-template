import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { CustomLogger } from '../../modules/logger/logger.service';
import { ValidationErrorDto } from '../dto/api-response.dto';
import { ApiResponseMessage } from '../interfaces/api-response.interface';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let logger: jest.Mocked<CustomLogger>;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;

  const mockRequest = {
    url: '/test-endpoint',
    method: 'GET',
    get: jest.fn(),
    ip: '127.0.0.1',
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockHttpArgumentsHost = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        {
          provide: CustomLogger,
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
            setContext: jest.fn(),
            context: 'Bootstrap',
          },
        },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    logger = module.get(CustomLogger);

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    } as any;

    // Reset mocks
    jest.clearAllMocks();
    mockRequest.get.mockImplementation((header: string) => {
      if (header === 'user-agent') return 'test-user-agent';
      return undefined;
    });
  });

  describe('catch', () => {
    it('should handle HttpException with string message', () => {
      const exception = new HttpException(
        'Test error message',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error message',
          code: 400,
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle HttpException with object response containing message', () => {
      const exception = new HttpException(
        { message: 'Custom error message', statusCode: 404 },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Custom error message',
          code: 404,
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle validation errors with array of messages', () => {
      const exception = new HttpException(
        {
          message: [
            'name should not be empty',
            'email must be an email address',
            'age must be a number',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: ApiResponseMessage.VALIDATION_ERROR,
          code: 400,
          errors: [
            { field: 'name', message: 'name should not be empty' },
            { field: 'email', message: 'email must be an email address' },
            { field: 'age', message: 'age must be a number' },
          ],
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle HttpException with object response without message', () => {
      const exception = new HttpException(
        { statusCode: 403, error: 'Forbidden' },
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: ApiResponseMessage.FORBIDDEN,
          code: 403,
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );
    });

    it('should handle unexpected errors (non-HttpException)', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: ApiResponseMessage.INTERNAL_ERROR,
          code: 500,
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error: Unexpected error',
        exception,
        expect.objectContaining({
          url: '/test-endpoint',
          method: 'GET',
          userAgent: 'test-user-agent',
          ip: '127.0.0.1',
        }),
      );
    });

    it('should handle unknown exception type', () => {
      const exception = 'string exception';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: ApiResponseMessage.INTERNAL_ERROR,
          code: 500,
          timestamp: expect.any(String),
          path: '/test-endpoint',
        }),
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Unexpected error: Unknown error',
        undefined,
        expect.objectContaining({
          url: '/test-endpoint',
          method: 'GET',
          userAgent: 'test-user-agent',
          ip: '127.0.0.1',
        }),
      );
    });

    it('should log 4xx errors (except validation errors)', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(logger.warn).toHaveBeenCalledWith(
        'HTTP 404 Error: Not found',
        undefined,
        expect.objectContaining({
          url: '/test-endpoint',
          method: 'GET',
          statusCode: 404,
          userAgent: 'test-user-agent',
          ip: '127.0.0.1',
        }),
      );
    });

    it('should not log validation errors (4xx with errors array)', () => {
      const exception = new HttpException(
        {
          message: ['name should not be empty'],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should not log 5xx errors twice (already logged as ERROR)', () => {
      const exception = new Error('Server error');

      filter.catch(exception, mockArgumentsHost);

      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation error messages correctly', () => {
      const messages = [
        'name should not be empty',
        'email must be an email address',
        'age must be a positive number',
      ];

      const result = (filter as any).formatValidationErrors(messages);

      expect(result).toEqual([
        new ValidationErrorDto('name', 'name should not be empty'),
        new ValidationErrorDto('email', 'email must be an email address'),
        new ValidationErrorDto('age', 'age must be a positive number'),
      ]);
    });

    it('should handle messages without clear field names', () => {
      const messages = ['must be a valid input', 'invalid format provided'];

      const result = (filter as any).formatValidationErrors(messages);

      expect(result).toEqual([
        new ValidationErrorDto('must', 'must be a valid input'),
        new ValidationErrorDto('invalid', 'invalid format provided'),
      ]);
    });

    it('should handle messages that do not match field extraction pattern', () => {
      const messages = ['Invalid request body', 'Malformed JSON'];

      const result = (filter as any).formatValidationErrors(messages);

      expect(result).toEqual([
        new ValidationErrorDto('Invalid', 'Invalid request body'),
        new ValidationErrorDto('Malformed', 'Malformed JSON'),
      ]);
    });
  });

  describe('getDefaultMessage', () => {
    it('should return correct default message for BAD_REQUEST', () => {
      const result = (filter as any).getDefaultMessage(400);
      expect(result).toBe(ApiResponseMessage.BAD_REQUEST);
    });

    it('should return correct default message for UNAUTHORIZED', () => {
      const result = (filter as any).getDefaultMessage(401);
      expect(result).toBe(ApiResponseMessage.UNAUTHORIZED);
    });

    it('should return correct default message for FORBIDDEN', () => {
      const result = (filter as any).getDefaultMessage(403);
      expect(result).toBe(ApiResponseMessage.FORBIDDEN);
    });

    it('should return correct default message for NOT_FOUND', () => {
      const result = (filter as any).getDefaultMessage(404);
      expect(result).toBe(ApiResponseMessage.NOT_FOUND);
    });

    it('should return correct default message for INTERNAL_SERVER_ERROR', () => {
      const result = (filter as any).getDefaultMessage(500);
      expect(result).toBe(ApiResponseMessage.INTERNAL_ERROR);
    });

    it('should return generic message for unknown status codes', () => {
      const result = (filter as any).getDefaultMessage(418);
      expect(result).toBe('An error occurred');
    });
  });

  describe('logWithContext', () => {
    it('should temporarily change context for error logging', () => {
      (filter as any).logWithContext('error', 'Test error', new Error('test'), {
        test: 'data',
      });

      expect(logger.setContext).toHaveBeenCalledWith('HttpExceptionFilter');
      expect(logger.error).toHaveBeenCalledWith(
        'Test error',
        new Error('test'),
        { test: 'data' },
      );
      // Should restore original context (we can't access private property to verify exact value)
      expect(logger.setContext).toHaveBeenCalledTimes(2);
    });

    it('should temporarily change context for warn logging', () => {
      (filter as any).logWithContext('warn', 'Test warning', undefined, {
        test: 'data',
      });

      expect(logger.setContext).toHaveBeenCalledWith('HttpExceptionFilter');
      expect(logger.warn).toHaveBeenCalledWith('Test warning', undefined, {
        test: 'data',
      });
      // Should restore original context (we can't access private property to verify exact value)
      expect(logger.setContext).toHaveBeenCalledTimes(2);
    });
  });
});
