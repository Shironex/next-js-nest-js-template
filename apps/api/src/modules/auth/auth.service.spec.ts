import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { LoggerFactory, ContextBoundLogger } from '../logger/logger.factory';
import { PasswordHashingService } from './services/passwordHashing.service';
import { usersRepositoryService } from '../user/services/users.repository.service';
import { VerificationCodeService } from './services/verificationCode.service';
import { MailService } from '../mail/mail.service';
import { SessionService } from './services/session/session.service';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { SessionCookieService } from './services/session/sessionCookie.service';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordResetToken, User, Role } from 'generated/prisma';

// Helper function to create mock user data
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user_123',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  emailVerified: true,
  isActive: true,
  role: Role.USER,
  lastPasswordChangeAt: null,
  passwordChangeCount: 0,
  failedLoginAttempts: 0,
  lastFailedLoginAt: null,
  lockedUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper function to create mock password reset token
const createMockPasswordResetToken = (
  overrides?: Partial<PasswordResetToken>,
): PasswordResetToken => ({
  id: 'reset_123',
  token: 'reset-token',
  userId: 'user_123',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;
  let userRepository: DeepMockProxy<usersRepositoryService>;
  let passwordHasher: DeepMockProxy<PasswordHashingService>;
  let verificationCodeService: DeepMockProxy<VerificationCodeService>;
  let mailService: DeepMockProxy<MailService>;
  let sessionService: DeepMockProxy<SessionService>;
  let loggerFactory: DeepMockProxy<LoggerFactory>;
  let mockLogger: DeepMockProxy<ContextBoundLogger>;
  let sessionCookieService: DeepMockProxy<SessionCookieService>;
  let passwordResetService: DeepMockProxy<PasswordResetService>;

  // Helper function to create mock User
  const createMockUser = (overrides: Partial<User> = {}): User => ({
    id: 'user_123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    emailVerified: true,
    isActive: true,
    role: Role.USER,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    lockedUntil: null,
    lastPasswordChangeAt: null,
    passwordChangeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Helper function to create mock PasswordResetToken
  const createMockResetToken = (
    overrides: Partial<PasswordResetToken> = {},
  ): PasswordResetToken => ({
    id: 'reset_123',
    token: 'reset-token-123',
    userId: 'user_123',
    expiresAt: new Date(Date.now() + 3600000),
    ...overrides,
  });

  beforeEach(async () => {
    mockLogger = mockDeep<ContextBoundLogger>();
    const mockLoggerFactory = mockDeep<LoggerFactory>();
    mockLoggerFactory.createLogger.mockReturnValue(mockLogger);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: LoggerFactory,
          useValue: mockLoggerFactory,
        },
        {
          provide: usersRepositoryService,
          useValue: mockDeep<usersRepositoryService>(),
        },
        {
          provide: PasswordHashingService,
          useValue: mockDeep<PasswordHashingService>(),
        },
        {
          provide: VerificationCodeService,
          useValue: mockDeep<VerificationCodeService>(),
        },
        {
          provide: MailService,
          useValue: mockDeep<MailService>(),
        },
        {
          provide: SessionService,
          useValue: mockDeep<SessionService>(),
        },
        {
          provide: SessionCookieService,
          useValue: mockDeep<SessionCookieService>(),
        },
        {
          provide: PasswordResetService,
          useValue: mockDeep<PasswordResetService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    loggerFactory = module.get(LoggerFactory);
    userRepository = module.get(usersRepositoryService);
    passwordHasher = module.get(PasswordHashingService);
    verificationCodeService = module.get(VerificationCodeService);
    mailService = module.get(MailService);
    sessionService = module.get(SessionService);
    sessionCookieService = module.get(SessionCookieService);
    passwordResetService = module.get(PasswordResetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      phoneNumber: '+1234567890',
      turnstileToken: 'mock-turnstile-token',
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user_123',
        email: mockRegisterDto.email,
        username: mockRegisterDto.username,
        password: 'hashedPassword',
        role: 'USER' as any,
        isActive: true,
        emailVerified: false,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        lastPasswordChangeAt: null,
        passwordChangeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVerificationCode = 'ABC123';

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      passwordHasher.hashPassword.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser);
      verificationCodeService.createEmailVerificationCode.mockResolvedValue(
        mockVerificationCode,
      );
      mailService.sendVerificationCode.mockResolvedValue(undefined);

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual({
        message:
          'Rejestracja zakończona pomyślnie. Sprawdź swoją skrzynkę pocztową w celu weryfikacji konta.',
        nextSteps:
          'Kliknij link weryfikacyjny w wysłanym mailu, aby aktywować swoje konto.',
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockRegisterDto.username,
      );
      expect(passwordHasher.hashPassword).toHaveBeenCalledWith(
        mockRegisterDto.password,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
        password: 'hashedPassword',
        username: mockRegisterDto.username,
      });
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).toHaveBeenCalledWith(mockUser);
      expect(mailService.sendVerificationCode).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockVerificationCode,
      );
    });

    it('should throw BadRequestException when email already exists', async () => {
      const existingUser = {
        id: 'user_456',
        email: mockRegisterDto.email,
        username: 'existinguser',
        password: 'hashedPassword',
        role: 'USER' as any,
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        lastPasswordChangeAt: null,
        passwordChangeCount: 0,

        updatedAt: new Date(),
      };
      userRepository.findByEmail.mockResolvedValue(existingUser as any);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Ten adres email jest już zajęty',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Registration failed - user already exists',
        {
          email: mockRegisterDto.email,
          existingUserId: existingUser.id,
        },
      );
    });

    it('should throw BadRequestException when username already exists', async () => {
      const existingUser = {
        id: 'user_789',
        email: 'different@example.com',
        username: mockRegisterDto.username,
        password: 'hashedPassword',
        role: 'USER' as any,
        isActive: true,
        emailVerified: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        lastPasswordChangeAt: null,
        passwordChangeCount: 0,

        updatedAt: new Date(),
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(existingUser as any);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Nazwa użytkownika jest już zajęta',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Registration failed - username already taken',
        {
          email: mockRegisterDto.email,
          username: mockRegisterDto.username,
          existingUserId: existingUser.id,
        },
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during user registration',
        expect.any(Error),
        {
          email: mockRegisterDto.email,
          username: mockRegisterDto.username,
        },
      );
    });

    it('should re-throw BadRequestException without wrapping', async () => {
      const badRequestError = new BadRequestException('Custom bad request');
      userRepository.findByEmail.mockRejectedValue(badRequestError);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        badRequestError,
      );
    });
  });

  describe('verifyEmail', () => {
    const mockEmail = 'test@example.com';
    const mockCode = '12345678';

    const mockUser = {
      id: 'user_123',
      email: mockEmail,
      emailVerified: false,
      username: 'testuser',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully verify email', async () => {
      const mockVerificationCode = {
        id: 'code_123',
        code: mockCode,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      };

      const mockUpdatedUser = {
        ...mockUser,
        emailVerified: true,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      verificationCodeService.findAndDeleteVerificationCode.mockResolvedValue(
        mockVerificationCode as any,
      );
      verificationCodeService.isCodeValid.mockReturnValue(true);
      userRepository.update.mockResolvedValue(mockUpdatedUser as any);

      const result = await service.verifyEmail(mockEmail, mockCode);

      expect(result).toEqual({
        message: 'Konto zostało zweryfikowane',
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(
        verificationCodeService.findAndDeleteVerificationCode,
      ).toHaveBeenCalledWith(mockUser.id, mockCode);
      expect(verificationCodeService.isCodeValid).toHaveBeenCalledWith(
        mockVerificationCode,
        mockUser.id,
        mockCode,
      );
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        emailVerified: true,
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.verifyEmail(mockEmail, mockCode)).rejects.toThrow(
        'Nie znaleziono użytkownika o podanym adresie email',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email verification failed - user not found',
        { email: mockEmail },
      );
    });

    it('should return success message when email already verified', async () => {
      const verifiedUser = {
        ...mockUser,
        emailVerified: true,
      };

      userRepository.findByEmail.mockResolvedValue(verifiedUser as any);

      const result = await service.verifyEmail(mockEmail, mockCode);

      expect(result).toEqual({
        message: 'Konto zostało już zweryfikowane',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Email already verified', {
        email: mockEmail,
        userId: mockUser.id,
      });
      expect(
        verificationCodeService.findAndDeleteVerificationCode,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when verification code not found', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      verificationCodeService.findAndDeleteVerificationCode.mockResolvedValue(
        null,
      );

      await expect(service.verifyEmail(mockEmail, mockCode)).rejects.toThrow(
        'Kod weryfikacji jest nieprawidłowy',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email verification failed - invalid code',
        {
          email: mockEmail,
          userId: mockUser.id,
          codeLength: mockCode.length,
        },
      );
    });

    it('should throw BadRequestException when verification code is invalid', async () => {
      const mockVerificationCode = {
        id: 'code_123',
        code: mockCode,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // expired
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      verificationCodeService.findAndDeleteVerificationCode.mockResolvedValue(
        mockVerificationCode as any,
      );
      verificationCodeService.isCodeValid.mockReturnValue(false);

      await expect(service.verifyEmail(mockEmail, mockCode)).rejects.toThrow(
        'Kod weryfikacji wygasł lub jest nieprawidłowy',
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email verification failed - code expired or invalid',
        {
          email: mockEmail,
          userId: mockUser.id,
          verificationCodeId: mockVerificationCode.id,
          expiresAt: mockVerificationCode.expiresAt,
        },
      );
    });

    it('should throw InternalServerErrorException when user update fails', async () => {
      const mockVerificationCode = {
        id: 'code_123',
        code: mockCode,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      verificationCodeService.findAndDeleteVerificationCode.mockResolvedValue(
        mockVerificationCode as any,
      );
      verificationCodeService.isCodeValid.mockReturnValue(true);
      userRepository.update.mockResolvedValue(undefined as any);

      await expect(service.verifyEmail(mockEmail, mockCode)).rejects.toThrow(
        'Wystąpił błąd podczas weryfikacji adresu email',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Email verification failed - user update failed',
        {
          email: mockEmail,
          userId: mockUser.id,
        },
      );
    });

    it('should log successful verification', async () => {
      const mockVerificationCode = {
        id: 'code_123',
        code: mockCode,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };

      const mockUpdatedUser = {
        ...mockUser,
        emailVerified: true,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      verificationCodeService.findAndDeleteVerificationCode.mockResolvedValue(
        mockVerificationCode as any,
      );
      verificationCodeService.isCodeValid.mockReturnValue(true);
      userRepository.update.mockResolvedValue(mockUpdatedUser as any);

      await service.verifyEmail(mockEmail, mockCode);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email verification successful',
        {
          email: mockEmail,
          userId: mockUser.id,
        },
      );
    });
  });

  describe('logout', () => {
    const mockSessionId = 'session_123';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully logout and return blank cookie', async () => {
      const mockBlankCookie = {
        name: 'session_id',
        value: '',
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          expires: new Date(0),
        },
      };

      sessionService.invalidateSession.mockResolvedValue(undefined);
      sessionCookieService.createBlank.mockReturnValue(mockBlankCookie as any);

      const result = await service.logout(mockSessionId);

      expect(sessionService.invalidateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
      expect(sessionCookieService.createBlank).toHaveBeenCalled();
      expect(result).toEqual(mockBlankCookie);
      expect(mockLogger.info).toHaveBeenCalledWith('Logout successful', {
        sessionId: mockSessionId,
      });
    });

    it('should return blank cookie even when invalidateSession fails', async () => {
      const mockBlankCookie = {
        name: 'session_id',
        value: '',
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          expires: new Date(0),
        },
      };

      sessionService.invalidateSession.mockRejectedValue(
        new Error('Session invalidation failed'),
      );
      sessionCookieService.createBlank.mockReturnValue(mockBlankCookie as any);

      const result = await service.logout(mockSessionId);

      expect(sessionService.invalidateSession).toHaveBeenCalledWith(
        mockSessionId,
      );
      expect(sessionCookieService.createBlank).toHaveBeenCalled();
      expect(result).toEqual(mockBlankCookie);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error during logout',
        expect.any(Error),
        {
          sessionId: mockSessionId,
        },
      );
    });

    it('should log logout attempt', async () => {
      const mockBlankCookie = {
        name: 'session_id',
        value: '',
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
          expires: new Date(0),
        },
      };

      sessionService.invalidateSession.mockResolvedValue(undefined);
      sessionCookieService.createBlank.mockReturnValue(mockBlankCookie as any);

      await service.logout(mockSessionId);

      expect(mockLogger.info).toHaveBeenCalledWith('User logout attempt', {
        sessionId: mockSessionId,
      });
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
      turnstileToken: 'mock-turnstile-token',
    };

    const mockRequest = {
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    } as unknown as Request;

    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    const mockUser = {
      id: 1,
      email: mockLoginDto.email,
      password: 'hashedPassword',
      emailVerified: true,
      username: 'testuser',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully login a user with verified email', async () => {
      const mockCookie = {
        name: 'session',
        value: 'sessionValue',
        attributes: { httpOnly: true, secure: true },
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      passwordHasher.verifyPassword.mockResolvedValue(true);
      sessionService.createSession.mockResolvedValue(mockCookie as any);

      const result = await service.login(
        mockLoginDto,
        mockRequest,
        mockResponse,
      );

      expect(result).toEqual({
        message: 'Zalogowano pomyślnie',
        emailVerified: true,
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(passwordHasher.verifyPassword).toHaveBeenCalledWith(
        mockUser.password,
        mockLoginDto.password,
      );
      expect(sessionService.createSession).toHaveBeenCalledWith(
        mockUser.id,
        mockRequest,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        mockCookie.name,
        mockCookie.value,
        mockCookie.attributes,
      );
    });

    it('should successfully login a user with unverified email', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      const mockCookie = {
        name: 'session',
        value: 'sessionValue',
        attributes: { httpOnly: true, secure: true },
      };

      userRepository.findByEmail.mockResolvedValue(unverifiedUser as any);
      passwordHasher.verifyPassword.mockResolvedValue(true);
      sessionService.createSession.mockResolvedValue(mockCookie as any);

      const result = await service.login(
        mockLoginDto,
        mockRequest,
        mockResponse,
      );

      expect(result).toEqual({
        message: 'Zalogowano pomyślnie',
        emailVerified: false,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow('Nieprawidłowe dane logowania');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Login failed - user not found',
        { email: mockLoginDto.email },
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      passwordHasher.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow('Nieprawidłowe dane logowania');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Login failed - invalid password',
        {
          email: mockLoginDto.email,
          userId: mockUser.id,
        },
      );
    });

    it('should re-throw UnauthorizedException without wrapping', async () => {
      const unauthorizedError = new UnauthorizedException(
        'Custom unauthorized',
      );
      userRepository.findByEmail.mockRejectedValue(unauthorizedError);

      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow(unauthorizedError);
    });

    it('should re-throw ForbiddenException without wrapping', async () => {
      const forbiddenError = new ForbiddenException('Account locked');
      userRepository.findByEmail.mockRejectedValue(forbiddenError);

      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow(forbiddenError);
    });

    it('should throw UnauthorizedException on unexpected error', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(
        service.login(mockLoginDto, mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error during login',
        expect.any(Error),
        {
          email: mockLoginDto.email,
        },
      );
    });

    it('should log successful login with correct parameters', async () => {
      const mockCookie = {
        name: 'session',
        value: 'sessionValue',
        attributes: { httpOnly: true, secure: true },
      };

      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      passwordHasher.verifyPassword.mockResolvedValue(true);
      sessionService.createSession.mockResolvedValue(mockCookie as any);

      await service.login(mockLoginDto, mockRequest, mockResponse);

      expect(mockLogger.info).toHaveBeenCalledWith('Login successful', {
        email: mockLoginDto.email,
        userId: mockUser.id,
        emailVerified: mockUser.emailVerified,
      });
    });
  });

  describe('forgotPassword', () => {
    it('should successfully send reset password email for verified user', async () => {
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });
      const mockResetToken = createMockResetToken();
      const resetLink = 'https://example.com/reset?token=reset-token-123';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordResetService.findLastSentToken.mockResolvedValue(null);
      passwordResetService.createResetToken.mockResolvedValue(mockResetToken);
      passwordResetService.generateResetLink.mockReturnValue(resetLink);
      mailService.sendResetPasswordLink.mockResolvedValue(undefined);

      const result = await service.forgotPassword(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordResetService.findLastSentToken).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(passwordResetService.createResetToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(passwordResetService.generateResetLink).toHaveBeenCalledWith(
        mockResetToken.token,
      );
      expect(mailService.sendResetPasswordLink).toHaveBeenCalledWith(
        email,
        resetLink,
        mockUser.username,
      );
      expect(result).toEqual({
        message: 'Link do resetowania hasła został wysłany',
      });
      expect(mockLogger.info).toHaveBeenCalledWith('Password reset link sent', {
        email,
        userId: mockUser.id,
        resetTokenId: mockResetToken.id,
      });
    });

    it('should return generic message for non-existent user', async () => {
      const email = 'nonexistent@example.com';

      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordResetService.createResetToken).not.toHaveBeenCalled();
      expect(mailService.sendResetPasswordLink).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Użytkownik nie został znaleziony',
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Forgot password - user not found',
        {
          email,
        },
      );
    });

    it('should throw BadRequestException for unverified email', async () => {
      const email = 'unverified@example.com';
      const mockUser = createMockUser({
        email,
        emailVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Forgot password failed - email not verified',
        {
          email,
          userId: mockUser.id,
        },
      );
    });

    it('should throw BadRequestException if token already sent recently', async () => {
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });

      const existingToken: PasswordResetToken = {
        id: 'reset_existing',
        token: 'existing-token',
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordResetService.findLastSentToken.mockResolvedValue(existingToken);
      passwordResetService.isTokenValid.mockReturnValue(true);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Forgot password failed - token already sent',
        {
          email,
          userId: mockUser.id,
          existingTokenId: existingToken.id,
        },
      );
    });

    it('should allow new token if existing token is expired', async () => {
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });

      const expiredToken: PasswordResetToken = {
        id: 'reset_expired',
        token: 'expired-token',
        userId: 'user_123',
        expiresAt: new Date(Date.now() - 3600000), // expired
      };

      const newToken: PasswordResetToken = {
        id: 'reset_new',
        token: 'new-token',
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const resetLink = 'https://example.com/reset?token=new-token';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordResetService.findLastSentToken.mockResolvedValue(expiredToken);
      passwordResetService.isTokenValid.mockReturnValue(false);
      passwordResetService.createResetToken.mockResolvedValue(newToken);
      passwordResetService.generateResetLink.mockReturnValue(resetLink);
      mailService.sendResetPasswordLink.mockResolvedValue(undefined);

      const result = await service.forgotPassword(email);

      expect(passwordResetService.createResetToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(result).toEqual({
        message: 'Link do resetowania hasła został wysłany',
      });
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';
      const hashedPassword = 'hashed-new-password';

      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockUpdatedUser = createMockUser({
        email: 'test@example.com',
        password: hashedPassword,
        lastPasswordChangeAt: new Date(),
        passwordChangeCount: 1,
      });

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(
        mockResetToken,
      );
      passwordResetService.isTokenValid.mockReturnValue(true);
      passwordHasher.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.update.mockResolvedValue(mockUpdatedUser);
      sessionService.invalidateAllUserSessions.mockResolvedValue(undefined);

      const result = await service.resetPassword(token, newPassword);

      expect(passwordResetService.findAndDeleteResetToken).toHaveBeenCalledWith(
        token,
      );
      expect(passwordResetService.isTokenValid).toHaveBeenCalledWith(
        mockResetToken,
      );
      expect(passwordHasher.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(userRepository.update).toHaveBeenCalledWith(
        mockResetToken.userId,
        {
          password: hashedPassword,
        },
      );
      expect(sessionService.invalidateAllUserSessions).toHaveBeenCalledWith(
        mockResetToken.userId,
      );
      expect(result).toEqual({
        message: 'Hasło zostało zresetowane pomyślnie',
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Password reset successful',
        {
          userId: mockResetToken.userId,
          resetTokenId: mockResetToken.id,
        },
      );
    });

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewSecurePass123!';

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Password reset failed - invalid or expired token',
        {
          tokenLength: token.length,
          resetTokenId: undefined,
          expiresAt: undefined,
        },
      );
      expect(passwordHasher.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired token', async () => {
      const token = 'expired-token';
      const newPassword = 'NewSecurePass123!';

      const mockExpiredToken: PasswordResetToken = {
        id: 'reset_expired',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() - 3600000), // expired
      };

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(
        mockExpiredToken,
      );
      passwordResetService.isTokenValid.mockReturnValue(false);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Password reset failed - invalid or expired token',
        {
          tokenLength: token.length,
          resetTokenId: mockExpiredToken.id,
          expiresAt: mockExpiredToken.expiresAt,
        },
      );
      expect(passwordHasher.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should handle password hashing failure', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';

      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(
        mockResetToken,
      );
      passwordResetService.isTokenValid.mockReturnValue(true);
      passwordHasher.hashPassword.mockRejectedValue(
        new Error('Hashing failed'),
      );

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Hashing failed',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should handle user update failure', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';
      const hashedPassword = 'hashed-new-password';

      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(
        mockResetToken,
      );
      passwordResetService.isTokenValid.mockReturnValue(true);
      passwordHasher.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Database error',
      );
      expect(sessionService.invalidateAllUserSessions).not.toHaveBeenCalled();
    });

    it('should handle session invalidation failure gracefully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';
      const hashedPassword = 'hashed-new-password';

      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockUpdatedUser = createMockUser({
        email: 'test@example.com',
        password: hashedPassword,
        lastPasswordChangeAt: new Date(),
        passwordChangeCount: 1,
      });

      passwordResetService.findAndDeleteResetToken.mockResolvedValue(
        mockResetToken,
      );
      passwordResetService.isTokenValid.mockReturnValue(true);
      passwordHasher.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.update.mockResolvedValue(mockUpdatedUser);
      sessionService.invalidateAllUserSessions.mockRejectedValue(
        new Error('Session invalidation failed'),
      );

      // Should fail if session invalidation fails since it's not wrapped in try-catch
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Session invalidation failed',
      );

      expect(passwordResetService.findAndDeleteResetToken).toHaveBeenCalledWith(
        token,
      );
      expect(passwordHasher.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(userRepository.update).toHaveBeenCalledWith(
        mockResetToken.userId,
        {
          password: hashedPassword,
        },
      );
    });
  });

  describe('resendVerification', () => {
    const mockEmail = 'test@example.com';
    const mockCode = '87654321';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully resend verification code', async () => {
      const mockUser = createMockUser({
        email: mockEmail,
        emailVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      verificationCodeService.createEmailVerificationCode.mockResolvedValue(
        mockCode,
      );
      mailService.sendVerificationCode.mockResolvedValue(undefined);

      const result = await service.resendVerification(mockEmail);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).toHaveBeenCalledWith(mockUser);
      expect(mailService.sendVerificationCode).toHaveBeenCalledWith(
        mockEmail,
        mockCode,
      );
      expect(result).toEqual({
        message: 'New verification code has been sent to your email',
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Resend verification attempt',
        { email: mockEmail },
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Verification code resent successfully',
        {
          email: mockEmail,
          userId: mockUser.id,
        },
      );
    });

    it('should throw BadRequestException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        'User not found',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Resend verification failed - user not found',
        { email: mockEmail },
      );
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).not.toHaveBeenCalled();
      expect(mailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email already verified', async () => {
      const mockUser = createMockUser({
        email: mockEmail,
        emailVerified: true,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        'Your email is already verified',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Resend verification skipped - email already verified',
        {
          email: mockEmail,
          userId: mockUser.id,
        },
      );
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).not.toHaveBeenCalled();
      expect(mailService.sendVerificationCode).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when code generation fails', async () => {
      const mockUser = createMockUser({
        email: mockEmail,
        emailVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      verificationCodeService.createEmailVerificationCode.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        'An error occurred while resending verification code',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).toHaveBeenCalledWith(mockUser);
      expect(mailService.sendVerificationCode).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to resend verification code',
        {
          email: mockEmail,
          userId: mockUser.id,
          error: 'Database error',
          stack: expect.any(String),
        },
      );
    });

    it('should throw InternalServerErrorException when email sending fails', async () => {
      const mockUser = createMockUser({
        email: mockEmail,
        emailVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      verificationCodeService.createEmailVerificationCode.mockResolvedValue(
        mockCode,
      );
      mailService.sendVerificationCode.mockRejectedValue(
        new Error('Email service error'),
      );

      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        'An error occurred while resending verification code',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockEmail);
      expect(
        verificationCodeService.createEmailVerificationCode,
      ).toHaveBeenCalledWith(mockUser);
      expect(mailService.sendVerificationCode).toHaveBeenCalledWith(
        mockEmail,
        mockCode,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to resend verification code',
        {
          email: mockEmail,
          userId: mockUser.id,
          error: 'Email service error',
          stack: expect.any(String),
        },
      );
    });

    it('should handle unexpected errors during resend process', async () => {
      const mockUser = createMockUser({
        email: mockEmail,
        emailVerified: false,
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Mock verificationCodeService to throw an error to simulate unexpected issues within try-catch
      verificationCodeService.createEmailVerificationCode.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.resendVerification(mockEmail)).rejects.toThrow(
        'An error occurred while resending verification code',
      );
    });
  });
});
