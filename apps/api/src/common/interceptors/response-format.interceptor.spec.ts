import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseFormatInterceptor } from './response-format.interceptor';
import { ApiSuccessResponseDto } from '../dto/api-response.dto';
import { ApiResponseMessage } from '../interfaces/api-response.interface';

describe('ResponseFormatInterceptor', () => {
  let interceptor: ResponseFormatInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  const mockRequest = {
    method: 'GET',
  };

  const mockResponse = {
    statusCode: 200,
  };

  const mockHttpContext = {
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseFormatInterceptor],
    }).compile();

    interceptor = module.get<ResponseFormatInterceptor>(
      ResponseFormatInterceptor,
    );

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as jest.Mocked<CallHandler>;

    // Reset mock states
    mockRequest.method = 'GET';
    mockResponse.statusCode = 200;
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should format successful response with default message', (done) => {
      const testData = { message: 'test data' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiSuccessResponseDto);
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.SUCCESS);
          expect(result.code).toBe(200);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });

    it('should return already formatted response as-is', (done) => {
      const preFormattedResponse = {
        success: true,
        message: 'Already formatted',
        code: 200,
        data: { test: 'data' },
      };
      mockCallHandler.handle.mockReturnValue(of(preFormattedResponse));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result).toEqual(preFormattedResponse);
          done();
        },
      });
    });

    it('should format POST response with CREATED message', (done) => {
      mockRequest.method = 'POST';
      mockResponse.statusCode = 201;
      const testData = { id: 1, name: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.CREATED);
          expect(result.code).toBe(201);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });

    it('should format PUT response with UPDATED message', (done) => {
      mockRequest.method = 'PUT';
      mockResponse.statusCode = 200;
      const testData = { id: 1, name: 'updated' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.UPDATED);
          expect(result.code).toBe(200);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });

    it('should format DELETE response with DELETED message', (done) => {
      mockRequest.method = 'DELETE';
      mockResponse.statusCode = 200;
      const testData = { deleted: true };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.DELETED);
          expect(result.code).toBe(200);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });

    it('should handle null/undefined data', (done) => {
      mockCallHandler.handle.mockReturnValue(of(null));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.SUCCESS);
          expect(result.code).toBe(200);
          expect(result.data).toBeNull();
          done();
        },
      });
    });

    it('should handle 204 No Content responses', (done) => {
      mockResponse.statusCode = 204;
      mockCallHandler.handle.mockReturnValue(of(undefined));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.SUCCESS);
          expect(result.code).toBe(204);
          expect(result.data).toBeUndefined();
          done();
        },
      });
    });

    it('should handle unknown status codes with default success message', (done) => {
      mockRequest.method = 'GET';
      mockResponse.statusCode = 202; // Accepted - not explicitly handled
      const testData = { processed: true };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (result) => {
          expect(result.success).toBe(true);
          expect(result.message).toBe(ApiResponseMessage.SUCCESS);
          expect(result.code).toBe(202);
          expect(result.data).toEqual(testData);
          done();
        },
      });
    });
  });
});
