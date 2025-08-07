import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiSuccessResponseDto } from '../dto/api-response.dto';
import { ApiResponseMessage } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // If the response is already formatted (has success property), return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Get the HTTP status code
        const statusCode = response.statusCode;

        // Determine the appropriate message based on status code and HTTP method
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        let message = ApiResponseMessage.SUCCESS;

        switch (statusCode) {
          case 201:
            message = ApiResponseMessage.CREATED;
            break;
          case 200:
            if (method === 'PUT' || method === 'PATCH') {
              message = ApiResponseMessage.UPDATED;
            } else if (method === 'DELETE') {
              message = ApiResponseMessage.DELETED;
            } else {
              message = ApiResponseMessage.SUCCESS;
            }
            break;
          case 204:
            message = ApiResponseMessage.SUCCESS;
            break;
          default:
            message = ApiResponseMessage.SUCCESS;
        }

        // Create the standardized response
        return new ApiSuccessResponseDto(data, message, statusCode);
      }),
    );
  }
}
