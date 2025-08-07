import {
  ApiSuccessResponseDto,
  ApiErrorResponseDto,
  ValidationErrorDto,
} from './api-response.dto';

describe('ApiSuccessResponseDto', () => {
  it('should create instance with default values', () => {
    const response = new ApiSuccessResponseDto();

    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.code).toBe(200);
    expect(response.data).toBeUndefined();
  });

  it('should create instance with custom data', () => {
    const testData = { id: 1, name: 'test' };
    const response = new ApiSuccessResponseDto(testData);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.code).toBe(200);
    expect(response.data).toEqual(testData);
  });

  it('should create instance with custom message', () => {
    const testData = { id: 1, name: 'test' };
    const customMessage = 'Data retrieved successfully';
    const response = new ApiSuccessResponseDto(testData, customMessage);

    expect(response.success).toBe(true);
    expect(response.message).toBe(customMessage);
    expect(response.code).toBe(200);
    expect(response.data).toEqual(testData);
  });

  it('should create instance with custom message and code', () => {
    const testData = { id: 1, name: 'test' };
    const customMessage = 'Resource created successfully';
    const customCode = 201;
    const response = new ApiSuccessResponseDto(
      testData,
      customMessage,
      customCode,
    );

    expect(response.success).toBe(true);
    expect(response.message).toBe(customMessage);
    expect(response.code).toBe(customCode);
    expect(response.data).toEqual(testData);
  });

  it('should handle null data', () => {
    const response = new ApiSuccessResponseDto(null);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.code).toBe(200);
    expect(response.data).toBeNull();
  });

  it('should handle undefined data explicitly', () => {
    const response = new ApiSuccessResponseDto(undefined);

    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.code).toBe(200);
    expect(response.data).toBeUndefined();
  });

  it('should handle complex nested data', () => {
    const complexData = {
      user: {
        id: 1,
        name: 'John Doe',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      metadata: {
        timestamp: '2023-01-01T00:00:00Z',
        version: 'v1.0.0',
      },
    };

    const response = new ApiSuccessResponseDto(complexData);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(complexData);
  });
});

describe('ValidationErrorDto', () => {
  it('should create instance with field and message', () => {
    const field = 'email';
    const message = 'Email must be a valid email address';
    const error = new ValidationErrorDto(field, message);

    expect(error.field).toBe(field);
    expect(error.message).toBe(message);
    expect(error.value).toBeUndefined();
  });

  it('should create instance with field, message, and value', () => {
    const field = 'email';
    const message = 'Email must be a valid email address';
    const value = 'invalid-email';
    const error = new ValidationErrorDto(field, message, value);

    expect(error.field).toBe(field);
    expect(error.message).toBe(message);
    expect(error.value).toBe(value);
  });

  it('should handle null value', () => {
    const field = 'name';
    const message = 'Name should not be empty';
    const value = null;
    const error = new ValidationErrorDto(field, message, value);

    expect(error.field).toBe(field);
    expect(error.message).toBe(message);
    expect(error.value).toBeNull();
  });

  it('should handle complex value objects', () => {
    const field = 'user';
    const message = 'User object is invalid';
    const value = { id: 'invalid', name: 123 };
    const error = new ValidationErrorDto(field, message, value);

    expect(error.field).toBe(field);
    expect(error.message).toBe(message);
    expect(error.value).toEqual(value);
  });
});

describe('ApiErrorResponseDto', () => {
  it('should create instance with default values', () => {
    const message = 'An error occurred';
    const response = new ApiErrorResponseDto(message);

    expect(response.success).toBe(false);
    expect(response.message).toBe(message);
    expect(response.code).toBe(500);
    expect(response.errors).toBeUndefined();
    expect(response.timestamp).toBeDefined();
    expect(typeof response.timestamp).toBe('string');
    expect(response.path).toBeUndefined();
  });

  it('should create instance with custom code', () => {
    const message = 'Bad request';
    const code = 400;
    const response = new ApiErrorResponseDto(message, code);

    expect(response.success).toBe(false);
    expect(response.message).toBe(message);
    expect(response.code).toBe(code);
    expect(response.errors).toBeUndefined();
    expect(response.timestamp).toBeDefined();
    expect(response.path).toBeUndefined();
  });

  it('should create instance with validation errors', () => {
    const message = 'Validation failed';
    const code = 400;
    const errors = [
      new ValidationErrorDto('email', 'Email must be valid', 'invalid-email'),
      new ValidationErrorDto('name', 'Name is required'),
    ];
    const response = new ApiErrorResponseDto(message, code, errors);

    expect(response.success).toBe(false);
    expect(response.message).toBe(message);
    expect(response.code).toBe(code);
    expect(response.errors).toEqual(errors);
    expect(response.timestamp).toBeDefined();
    expect(response.path).toBeUndefined();
  });

  it('should create instance with path', () => {
    const message = 'Not found';
    const code = 404;
    const path = '/api/v1/users/123';
    const response = new ApiErrorResponseDto(message, code, undefined, path);

    expect(response.success).toBe(false);
    expect(response.message).toBe(message);
    expect(response.code).toBe(code);
    expect(response.errors).toBeUndefined();
    expect(response.timestamp).toBeDefined();
    expect(response.path).toBe(path);
  });

  it('should create instance with all parameters', () => {
    const message = 'Validation failed';
    const code = 400;
    const errors = [
      new ValidationErrorDto('email', 'Email must be valid', 'invalid-email'),
    ];
    const path = '/api/v1/users';
    const response = new ApiErrorResponseDto(message, code, errors, path);

    expect(response.success).toBe(false);
    expect(response.message).toBe(message);
    expect(response.code).toBe(code);
    expect(response.errors).toEqual(errors);
    expect(response.timestamp).toBeDefined();
    expect(response.path).toBe(path);
  });

  it('should generate valid ISO timestamp', () => {
    const response = new ApiErrorResponseDto('Test error');

    expect(response.timestamp).toBeDefined();
    expect(() => new Date(response.timestamp!)).not.toThrow();

    const timestamp = new Date(response.timestamp!);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it('should handle empty errors array', () => {
    const message = 'Error with empty errors';
    const errors: ValidationErrorDto[] = [];
    const response = new ApiErrorResponseDto(message, 400, errors);

    expect(response.success).toBe(false);
    expect(response.errors).toEqual([]);
  });

  it('should handle multiple validation errors', () => {
    const message = 'Multiple validation errors';
    const errors = [
      new ValidationErrorDto('name', 'Name is required'),
      new ValidationErrorDto('email', 'Email must be valid', 'invalid-email'),
      new ValidationErrorDto('age', 'Age must be a number', 'not-a-number'),
      new ValidationErrorDto('password', 'Password is too short', '123'),
    ];
    const response = new ApiErrorResponseDto(message, 400, errors);

    expect(response.success).toBe(false);
    expect(response.errors).toHaveLength(4);
    expect(response.errors).toEqual(errors);
  });
});
