export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  data?: T;
  errors?: ValidationError[];
  timestamp?: string;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  code: number;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: number;
  errors?: ValidationError[];
  timestamp: string;
  path?: string;
}

export enum ApiResponseMessage {
  SUCCESS = 'Success',
  CREATED = 'Resource created successfully',
  UPDATED = 'Resource updated successfully',
  DELETED = 'Resource deleted successfully',
  NOT_FOUND = 'Resource not found',
  VALIDATION_ERROR = 'Validation failed',
  UNAUTHORIZED = 'Unauthorized access',
  FORBIDDEN = 'Access forbidden',
  INTERNAL_ERROR = 'Internal server error',
  BAD_REQUEST = 'Bad request',
}

// Type alias for compatibility
export interface ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: any;
  timestamp: string;
}
