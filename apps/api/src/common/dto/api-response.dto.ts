import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Data retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: 'Response data payload',
    example: { someData: 'value' },
  })
  data?: T;

  constructor(data?: T, message: string = 'Success', code: number = 200) {
    this.success = true;
    this.message = message;
    this.code = code;
    this.data = data;
  }
}

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Field that failed validation',
    example: 'email',
  })
  field: string;

  @ApiProperty({
    description: 'Validation error message',
    example: 'Email must be a valid email address',
  })
  message: string;

  @ApiProperty({
    description: 'The value that caused the validation error',
    example: 'invalid-email',
  })
  value?: any;

  constructor(field: string, message: string, value?: any) {
    this.field = field;
    this.message = message;
    this.value = value;
  }
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  code: number;

  @ApiProperty({
    description: 'Detailed error information',
    type: [ValidationErrorDto],
    example: [
      {
        field: 'email',
        message: 'Email must be a valid email address',
        value: 'invalid-email',
      },
    ],
  })
  errors?: ValidationErrorDto[];

  @ApiProperty({
    description: 'Error timestamp',
    example: '2023-01-01T12:00:00.000Z',
  })
  timestamp?: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/v1/users',
  })
  path?: string;

  constructor(
    message: string,
    code: number = 500,
    errors?: ValidationErrorDto[],
    path?: string,
  ) {
    this.success = false;
    this.message = message;
    this.code = code;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
