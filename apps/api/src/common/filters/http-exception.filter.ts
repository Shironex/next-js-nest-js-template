import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiErrorResponseDto,
  ValidationErrorDto,
} from '../dto/api-response.dto';
import { ApiResponseMessage } from '../interfaces/api-response.interface';
import { CustomLogger } from '../../modules/logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: CustomLogger;

  constructor(@Inject(CustomLogger) logger: CustomLogger) {
    this.logger = logger;
  }

  private logWithContext(
    level: 'error' | 'warn',
    message: string,
    meta?: any,
    context?: any,
  ): void {
    const originalContext = this.logger['context'];
    this.logger.setContext(HttpExceptionFilter.name);

    if (level === 'error') {
      this.logger.error(message, meta, context);
    } else {
      this.logger.warn(message, meta, context);
    }

    // Restore original context
    this.logger.setContext(originalContext);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: ValidationErrorDto[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;

        // Handle validation errors (class-validator)
        if (responseObj.message && Array.isArray(responseObj.message)) {
          message = ApiResponseMessage.VALIDATION_ERROR;
          errors = this.formatValidationErrors(responseObj.message);
        } else if (
          responseObj.message &&
          typeof responseObj.message === 'string'
        ) {
          message = responseObj.message;
        } else {
          message = this.getDefaultMessage(status);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = this.getDefaultMessage(status);
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = ApiResponseMessage.INTERNAL_ERROR;

      // Log unexpected errors
      this.logWithContext(
        'error',
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception : undefined,
        {
          url: request.url,
          method: request.method,
          userAgent: request.get('user-agent'),
          ip: request.ip,
        },
      );
    }

    const errorResponse = new ApiErrorResponseDto(
      message,
      status,
      errors,
      request.url,
    );

    // Log HTTP exceptions (but not validation errors and not already logged 500 errors)
    if (status >= 400 && status < 500 && !errors) {
      this.logWithContext(
        'warn',
        `HTTP ${status} Error: ${message}`,
        undefined,
        {
          url: request.url,
          method: request.method,
          statusCode: status,
          userAgent: request.get('user-agent'),
          ip: request.ip,
        },
      );
    }

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(messages: string[]): ValidationErrorDto[] {
    return messages.map((message) => {
      // Try to extract field name from validation message
      // Examples: "email must be a valid email", "name should not be empty"
      const fieldMatch = message.match(/^(\w+)\s/);
      const field = fieldMatch ? fieldMatch[1] : 'unknown';

      return new ValidationErrorDto(field, message);
    });
  }

  private getDefaultMessage(status: number): string {
    switch (status) {
      case 400: // HttpStatus.BAD_REQUEST
        return ApiResponseMessage.BAD_REQUEST;
      case 401: // HttpStatus.UNAUTHORIZED
        return ApiResponseMessage.UNAUTHORIZED;
      case 403: // HttpStatus.FORBIDDEN
        return ApiResponseMessage.FORBIDDEN;
      case 404: // HttpStatus.NOT_FOUND
        return ApiResponseMessage.NOT_FOUND;
      case 500: // HttpStatus.INTERNAL_SERVER_ERROR
        return ApiResponseMessage.INTERNAL_ERROR;
      default:
        return 'An error occurred';
    }
  }
}
