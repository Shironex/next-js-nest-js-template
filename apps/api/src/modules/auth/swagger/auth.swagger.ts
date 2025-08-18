import { HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiDocs } from '../../../common/decorators/swagger.decorator';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  ApiSuccessResponseDto,
  ApiErrorResponseDto,
} from '../../../common/dto/api-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';

// Register endpoint documentation
export const RegisterDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({
      summary: 'Register a new user account',
      description:
        'Creates a new user account with email verification. The user will need to verify their email before being able to access protected features. This endpoint is protected by Turnstile CAPTCHA and rate limiting for security.',
    }),
    ApiBody({
      type: RegisterDto,
      description: 'User registration data with required fields',
      examples: {
        validUser: {
          summary: 'Valid registration data',
          value: {
            email: 'user@example.com',
            password: 'MySecurePass123!',
            username: 'artlover2024',
            phoneNumber: '+48 123456789',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
        minimalUser: {
          summary: 'Minimal required data',
          value: {
            email: 'minimal@example.com',
            password: 'SecurePass1!',
            username: 'minimaluser',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered. Verification email sent.',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Resource created successfully',
        code: 201,
        data: {
          message:
            'Registration completed successfully. Check your email inbox to verify your account.',
          nextSteps:
            'Click the verification link in the sent email to activate your account.',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data or validation errors',
      type: ApiErrorResponseDto,
      examples: {
        validationError: {
          summary: 'Multiple validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'email',
                message: 'email must be a valid email',
                value: 'invalid-email',
              },
              {
                field: 'password',
                message:
                  'password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
                value: '123',
              },
              {
                field: 'username',
                message: 'username should not be empty',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/register',
          },
        },
        businessLogicError: {
          summary: 'Business logic error (email exists)',
          value: {
            success: false,
            message: 'This email address is already taken',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/register',
          },
        },
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit exceeded for registration attempts',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Rate limit exceeded',
        code: 429,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/register',
      },
      headers: {
        'X-RateLimit-Limit': {
          description: 'Rate limit maximum requests',
          schema: {
            type: 'number',
            example: 3,
          },
        },
        'X-RateLimit-Remaining': {
          description: 'Rate limit remaining requests',
          schema: {
            type: 'number',
            example: 0,
          },
        },
        'X-RateLimit-Reset': {
          description: 'Rate limit reset time (Unix timestamp)',
          schema: {
            type: 'number',
            example: 1715781000,
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during registration',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/register',
      },
    }),
  );

// Login endpoint documentation
export const LoginDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'User login',
      description:
        'Authenticate user with email and password. Creates a secure session and sets authentication cookie. This endpoint is protected by Turnstile CAPTCHA and rate limiting for security. The user must have a verified email address to successfully log in.',
    }),
    ApiBody({
      type: LoginDto,
      description: 'User login credentials with CAPTCHA verification',
      examples: {
        validLogin: {
          summary: 'Valid login credentials',
          value: {
            email: 'user@example.com',
            password: 'MySecurePass123!',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
        existingUser: {
          summary: 'Existing verified user',
          value: {
            email: 'verified@example.com',
            password: 'SecurePass1!',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description:
        'User successfully authenticated. Session created and cookie set.',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Login successful',
        code: 200,
        data: {
          emailVerified: true,
        },
      },
      headers: {
        'Set-Cookie': {
          description: 'Authentication session cookie',
          schema: {
            type: 'string',
            example:
              'session-token=abc123...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data or validation errors',
      type: ApiErrorResponseDto,
      examples: {
        validationError: {
          summary: 'Multiple validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'email',
                message: 'Niepoprawny adres email',
                value: 'invalid-email',
              },
              {
                field: 'password',
                message: 'Password is required',
                value: '',
              },
              {
                field: 'turnstileToken',
                message: 'Captcha verification is required',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/login',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication failed due to invalid credentials',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Invalid login credentials',
        code: 401,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/login',
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit exceeded for login attempts',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Rate limit exceeded',
        code: 429,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/login',
      },
      headers: {
        'X-RateLimit-Limit': {
          description: 'Rate limit maximum requests',
          schema: {
            type: 'number',
            example: 3,
          },
        },
        'X-RateLimit-Remaining': {
          description: 'Rate limit remaining requests',
          schema: {
            type: 'number',
            example: 0,
          },
        },
        'X-RateLimit-Reset': {
          description: 'Rate limit reset time (Unix timestamp)',
          schema: {
            type: 'number',
            example: 1715781000,
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during authentication',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/login',
      },
    }),
  );

// Email verification endpoint documentation
export const VerifyEmailDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Verify email address',
      description:
        'Verify user email address using verification code sent during registration. This endpoint requires authentication and activates the user account for full access. The verification code is single-use and expires after a certain time.',
    }),
    ApiBody({
      type: VerifyEmailDto,
      description: 'Email verification data with code and CAPTCHA token',
      examples: {
        validVerification: {
          summary: 'Valid verification data',
          value: {
            code: 'ABC12345',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
        shortCode: {
          summary: 'Short verification code',
          value: {
            code: '123456',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Email successfully verified',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'Account has been verified',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Email already verified',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'Account is already verified',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid verification code or validation errors',
      type: ApiErrorResponseDto,
      examples: {
        invalidCode: {
          summary: 'Invalid or expired verification code',
          value: {
            success: false,
            message: 'Verification code is invalid',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/verify-email',
          },
        },
        expiredCode: {
          summary: 'Expired verification code',
          value: {
            success: false,
            message: 'Verification code is expired or invalid',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/verify-email',
          },
        },
        validationError: {
          summary: 'Validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'code',
                message: 'code should not be empty',
                value: '',
              },
              {
                field: 'turnstileToken',
                message: 'turnstileToken should not be empty',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/verify-email',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required - user must be logged in',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Unauthorized',
        code: 401,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/verify-email',
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during verification',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/verify-email',
      },
    }),
  );

// Password reset request endpoint documentation
export const ForgotPasswordDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Request password reset',
      description:
        'Send password reset email to user. The user will receive an email with a secure reset link that expires after 1 hour. This endpoint is protected by CAPTCHA and rate limiting. Only verified users can request password reset.',
    }),
    ApiBody({
      type: ForgotPasswordDto,
      description: 'Password reset request data with email and CAPTCHA token',
      examples: {
        validRequest: {
          summary: 'Valid password reset request',
          value: {
            email: 'user@example.com',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
        existingUser: {
          summary: 'Existing verified user',
          value: {
            email: 'verified@example.com',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Password reset link sent successfully',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'Password reset link has been sent',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'User not found (generic response for security)',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'User not found',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data or business logic errors',
      type: ApiErrorResponseDto,
      examples: {
        emailNotVerified: {
          summary: 'Email address not verified',
          value: {
            success: false,
            message: 'Email address has not been verified',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/forgot-password',
          },
        },
        tokenAlreadySent: {
          summary: 'Reset token already sent recently',
          value: {
            success: false,
            message: 'Password reset link has already been sent',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/forgot-password',
          },
        },
        validationError: {
          summary: 'Validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'email',
                message: 'email must be a valid email',
                value: 'invalid-email',
              },
              {
                field: 'turnstileToken',
                message: 'turnstileToken should not be empty',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/forgot-password',
          },
        },
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit exceeded for password reset requests',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Rate limit exceeded',
        code: 429,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/forgot-password',
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during password reset request',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/forgot-password',
      },
    }),
  );

// Password reset endpoint documentation
export const ResetPasswordDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Reset password using token',
      description:
        'Reset user password using reset token from email. The reset token is single-use and expires after 1 hour for security. After successful reset, all user sessions are invalidated. This endpoint is protected by CAPTCHA.',
    }),
    ApiBody({
      type: ResetPasswordDto,
      description:
        'Password reset data with token, new password, and CAPTCHA token',
      examples: {
        validReset: {
          summary: 'Valid password reset',
          value: {
            token: 'abc123def456ghi789jkl012mno345',
            newPassword: 'MyNewSecurePass123!',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
        strongPassword: {
          summary: 'Strong password with special characters',
          value: {
            token: 'valid-reset-token-from-email',
            newPassword: 'Str0ng!P@ssw0rd#2024',
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Password successfully reset',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'Password has been reset successfully',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid token, weak password, or validation errors',
      type: ApiErrorResponseDto,
      examples: {
        invalidToken: {
          summary: 'Invalid or expired reset token',
          value: {
            success: false,
            message: 'Token is invalid or expired',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/reset-password',
          },
        },
        weakPassword: {
          summary: 'Password does not meet requirements',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'newPassword',
                message: 'password is not strong enough',
                value: 'weak123',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/reset-password',
          },
        },
        validationErrors: {
          summary: 'Multiple validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'token',
                message: 'token should not be empty',
                value: '',
              },
              {
                field: 'newPassword',
                message: 'newPassword should not be empty',
                value: '',
              },
              {
                field: 'turnstileToken',
                message: 'turnstileToken should not be empty',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/reset-password',
          },
        },
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit exceeded for password reset attempts',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Rate limit exceeded',
        code: 429,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/reset-password',
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during password reset',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/reset-password',
      },
    }),
  );

export const LogoutDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Logout user',
      description:
        'Invalidates the current session and clears the session cookie.',
    }),
    ApiOkResponse({
      description: 'User successfully logged out',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'Logout successful',
          },
        },
      },
    }),
  );

// Resend verification endpoint documentation
export const ResendVerificationDocs = () =>
  ApiDocs(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Resend email verification code',
      description:
        "Resends a new verification code to the authenticated user's email address. This endpoint requires the user to be logged in but not yet verified. The new verification code expires after 10 minutes and replaces any previously sent codes. This endpoint is protected by CAPTCHA and rate limiting to prevent abuse.",
    }),
    ApiBody({
      type: ResendVerificationDto,
      description: 'Resend verification request with CAPTCHA token',
      examples: {
        validRequest: {
          summary: 'Valid resend request',
          value: {
            turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'New verification code sent successfully',
      type: ApiSuccessResponseDto,
      example: {
        success: true,
        message: 'Request completed successfully',
        code: 200,
        data: {
          message: 'New verification code has been sent to your email',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request or business logic errors',
      type: ApiErrorResponseDto,
      examples: {
        alreadyVerified: {
          summary: 'Email already verified',
          value: {
            success: false,
            message: 'Your email is already verified',
            code: 400,
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/resend-verification',
          },
        },
        validationError: {
          summary: 'Validation errors',
          value: {
            success: false,
            message: 'Validation failed',
            code: 400,
            errors: [
              {
                field: 'turnstileToken',
                message: 'turnstileToken should not be empty',
                value: '',
              },
            ],
            timestamp: '2024-01-15T10:30:00.000Z',
            path: '/auth/resend-verification',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required - user must be logged in',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Unauthorized',
        code: 401,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/resend-verification',
      },
    }),
    ApiTooManyRequestsResponse({
      description: 'Rate limit exceeded for verification resend attempts',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Rate limit exceeded',
        code: 429,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/resend-verification',
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error during verification resend',
      type: ApiErrorResponseDto,
      example: {
        success: false,
        message: 'Internal server error',
        code: 500,
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/auth/resend-verification',
      },
    }),
  );
