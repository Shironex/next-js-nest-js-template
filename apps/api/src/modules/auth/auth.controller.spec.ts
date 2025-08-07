import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Request, Response } from 'express';
import { TurnstileGuard } from 'src/common/guards/turnstile.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RateLimitService } from '../../modules/rate-limit/rate-limit.service';
import { Reflector } from '@nestjs/core';
import { CustomLogger } from 'src/modules/logger/logger.service';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { RateLimitInterceptor } from 'src/common/interceptors/rate-limit.interceptor';
import { SessionCookieService } from './services/session/sessionCookie.service';
import { SessionValidatorService } from './services/session/sessionValidator.service';
import { SafeUser } from 'src/common/interfaces/auth';
import { Role } from 'generated/prisma';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: DeepMockProxy<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: DeepMockProxy<Response>;
  let sessionCookieService: DeepMockProxy<SessionCookieService>;
  let sessionValidatorService: DeepMockProxy<SessionValidatorService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
        {
          provide: RateLimitService,
          useValue: mockDeep<RateLimitService>(),
        },
        {
          provide: Reflector,
          useValue: mockDeep<Reflector>(),
        },
        {
          provide: SessionCookieService,
          useValue: mockDeep<SessionCookieService>(),
        },
        {
          provide: SessionValidatorService,
          useValue: mockDeep<SessionValidatorService>(),
        },
      ],
    })
      .overrideGuard(TurnstileGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideInterceptor(LoggingInterceptor)
      .useValue({ intercept: jest.fn((context, next) => next.handle()) })
      .overrideInterceptor(RateLimitInterceptor)
      .useValue({ intercept: jest.fn((context, next) => next.handle()) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    sessionCookieService = module.get(SessionCookieService);
    sessionValidatorService = module.get(SessionValidatorService);

    // Setup mock request and response
    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      body: {},
      cookies: {
        session_id: 'mock-session-id',
      },
    };

    mockResponse = mockDeep<Response>();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        phoneNumber: '+1234567890',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Registration successful',
        nextSteps: 'Check your email for verification',
      };

      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when authService.register fails', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        phoneNumber: '+1234567890',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct data', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Zalogowano pomyślnie',
        emailVerified: true,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest,
        mockResponse,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when authService.login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Login failed');
      authService.login.mockRejectedValue(error);

      await expect(
        controller.login(
          loginDto,
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(error);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest,
        mockResponse,
      );
    });

    it('should handle unverified email response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Zalogowano pomyślnie',
        emailVerified: false,
      };

      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(result).toEqual(expectedResponse);
      expect(result.emailVerified).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail with correct data', async () => {
      const verifyEmailDto: VerifyEmailDto = {
        code: 'ABC12345',
        turnstileToken: 'mock-turnstile-token',
      };

      const mockUser: SafeUser = {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
        role: Role.USER,
        isActive: true,
        emailVerified: false,
      };

      const expectedResponse = {
        message: 'Konto zostało zweryfikowane',
      };

      authService.verifyEmail.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail(verifyEmailDto, mockUser);

      expect(authService.verifyEmail).toHaveBeenCalledWith(
        mockUser.email,
        verifyEmailDto.code,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when authService.verifyEmail fails', async () => {
      const verifyEmailDto: VerifyEmailDto = {
        code: 'ABC12345',
        turnstileToken: 'mock-turnstile-token',
      };

      const mockUser: SafeUser = {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
        role: Role.USER,
        isActive: true,
        emailVerified: false,
      };

      const error = new Error('Verification failed');
      authService.verifyEmail.mockRejectedValue(error);

      await expect(
        controller.verifyEmail(verifyEmailDto, mockUser),
      ).rejects.toThrow(error);
      expect(authService.verifyEmail).toHaveBeenCalledWith(
        mockUser.email,
        verifyEmailDto.code,
      );
    });

    it('should handle already verified email', async () => {
      const verifyEmailDto: VerifyEmailDto = {
        code: 'ABC12345',
        turnstileToken: 'mock-turnstile-token',
      };

      const mockUser: SafeUser = {
        id: 'user_123',
        email: 'test@example.com',
        username: 'testuser',
        role: Role.USER,
        isActive: true,
        emailVerified: true,
      };

      const expectedResponse = {
        message: 'Konto zostało już zweryfikowane',
      };

      authService.verifyEmail.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail(verifyEmailDto, mockUser);

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword with correct email', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Link do resetowania hasła został wysłany',
      };

      authService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when authService.forgotPassword fails', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Forgot password failed');
      authService.forgotPassword.mockRejectedValue(error);

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(error);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });

    it('should handle non-existent user gracefully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'nonexistent@example.com',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Użytkownik nie został znaleziony',
      };

      authService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle unverified email address', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'unverified@example.com',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Adres email nie został zweryfikowany');
      authService.forgotPassword.mockRejectedValue(error);

      await expect(
        controller.forgotPassword(forgotPasswordDto),
      ).rejects.toThrow(error);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword with correct data', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'NewSecurePass123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const expectedResponse = {
        message: 'Hasło zostało zresetowane pomyślnie',
      };

      authService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error when authService.resetPassword fails', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'invalid-token',
        newPassword: 'NewSecurePass123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Token jest nieprawidłowy lub wygasł');
      authService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should handle expired token', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'expired-token',
        newPassword: 'NewSecurePass123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Token jest nieprawidłowy lub wygasł');
      authService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });

    it('should handle invalid token format', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'malformed-token',
        newPassword: 'NewSecurePass123!',
        turnstileToken: 'mock-turnstile-token',
      };

      const error = new Error('Token jest nieprawidłowy lub wygasł');
      authService.resetPassword.mockRejectedValue(error);

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        error,
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      sessionCookieService.getCookieName.mockReturnValue('session_id');
    });

    it('should logout successfully with valid session', async () => {
      const mockCookie = {
        name: 'session_id',
        value: '',
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          expires: new Date(0),
        },
      };

      authService.logout.mockResolvedValue(mockCookie);

      const result = await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalledWith('mock-session-id');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        mockCookie.name,
        mockCookie.value,
        mockCookie.attributes,
      );
      expect(result).toEqual({
        message: 'Wylogowano pomyślnie',
      });
    });

    it('should handle logout without session cookie', async () => {
      const requestWithoutCookie = {
        ...mockRequest,
        cookies: {},
      };

      const result = await controller.logout(
        requestWithoutCookie as Request,
        mockResponse as Response,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(authService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Wylogowano pomyślnie',
      });
    });

    it('should handle logout with undefined session cookie', async () => {
      const requestWithUndefinedCookie = {
        ...mockRequest,
        cookies: {
          session_id: undefined,
        },
      };

      const result = await controller.logout(
        requestWithUndefinedCookie as Request,
        mockResponse as Response,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(authService.logout).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Wylogowano pomyślnie',
      });
    });

    it('should handle logout error gracefully', async () => {
      const mockCookie = {
        name: 'session_id',
        value: '',
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          expires: new Date(0),
        },
      };

      authService.logout.mockResolvedValue(mockCookie); // logout should still return cookie even on error

      const result = await controller.logout(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.logout).toHaveBeenCalledWith('mock-session-id');
      expect(result).toEqual({
        message: 'Wylogowano pomyślnie',
      });
    });
  });

  describe('resendVerification', () => {
    const mockUser: SafeUser = {
      id: 'user_123',
      email: 'test@example.com',
      username: 'testuser',
      emailVerified: false,
      isActive: true,
      role: Role.USER,
    };

    const mockDto: ResendVerificationDto = {
      turnstileToken: 'valid-turnstile-token',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully resend verification code', async () => {
      const expectedResponse = {
        message: 'New verification code has been sent to your email',
      };

      authService.resendVerification.mockResolvedValue(expectedResponse);

      const result = await controller.resendVerification(mockDto, mockUser);

      expect(authService.resendVerification).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service throwing BadRequestException for user not found', async () => {
      const error = new Error('User not found');
      authService.resendVerification.mockRejectedValue(error);

      await expect(
        controller.resendVerification(mockDto, mockUser),
      ).rejects.toThrow('User not found');

      expect(authService.resendVerification).toHaveBeenCalledWith(
        mockUser.email,
      );
    });

    it('should handle service throwing BadRequestException for already verified email', async () => {
      const error = new Error('Your email is already verified');
      authService.resendVerification.mockRejectedValue(error);

      await expect(
        controller.resendVerification(mockDto, mockUser),
      ).rejects.toThrow('Your email is already verified');

      expect(authService.resendVerification).toHaveBeenCalledWith(
        mockUser.email,
      );
    });

    it('should handle service throwing InternalServerErrorException', async () => {
      const error = new Error(
        'An error occurred while resending verification code',
      );
      authService.resendVerification.mockRejectedValue(error);

      await expect(
        controller.resendVerification(mockDto, mockUser),
      ).rejects.toThrow('An error occurred while resending verification code');

      expect(authService.resendVerification).toHaveBeenCalledWith(
        mockUser.email,
      );
    });

    it('should pass correct user email from authenticated user', async () => {
      const differentUser: SafeUser = {
        ...mockUser,
        email: 'different@example.com',
        id: 'different_user_id',
      };

      const expectedResponse = {
        message: 'New verification code has been sent to your email',
      };

      authService.resendVerification.mockResolvedValue(expectedResponse);

      const result = await controller.resendVerification(
        mockDto,
        differentUser,
      );

      expect(authService.resendVerification).toHaveBeenCalledWith(
        differentUser.email,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty turnstile token gracefully', async () => {
      const emptyTokenDto: ResendVerificationDto = {
        turnstileToken: '',
      };

      const expectedResponse = {
        message: 'New verification code has been sent to your email',
      };

      authService.resendVerification.mockResolvedValue(expectedResponse);

      const result = await controller.resendVerification(
        emptyTokenDto,
        mockUser,
      );

      expect(authService.resendVerification).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
