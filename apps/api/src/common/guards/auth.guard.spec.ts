import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { SessionCookieService } from '../../modules/auth/services/session/sessionCookie.service';
import { SessionValidatorService } from '../../modules/auth/services/session/sessionValidator.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { SafeUser, SafeSession } from '../interfaces/auth';
import { Role } from 'generated/prisma';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionCookieService: DeepMockProxy<SessionCookieService>;
  let sessionValidatorService: DeepMockProxy<SessionValidatorService>;
  let reflector: DeepMockProxy<Reflector>;
  let mockExecutionContext: DeepMockProxy<ExecutionContext>;
  let mockRequest: Partial<AuthRequest>;

  const mockUser: SafeUser = {
    id: 'user_123',
    email: 'test@example.com',
    username: 'testuser',
    role: Role.USER,
    isActive: true,
    emailVerified: true,
  };

  const mockSession: SafeSession = {
    id: 'session_123',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SessionCookieService,
          useValue: mockDeep<SessionCookieService>(),
        },
        {
          provide: SessionValidatorService,
          useValue: mockDeep<SessionValidatorService>(),
        },
        {
          provide: Reflector,
          useValue: mockDeep<Reflector>(),
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    sessionCookieService = module.get(SessionCookieService);
    sessionValidatorService = module.get(SessionValidatorService);
    reflector = module.get(Reflector);

    // Setup mocks
    mockExecutionContext = mockDeep<ExecutionContext>();
    mockRequest = {
      cookies: {},
      user: undefined,
      session: undefined,
    };

    mockExecutionContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    } as any);

    // Mock reflector to return false (not public) by default
    reflector.getAllAndOverride.mockReturnValue(false);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true and attach user/session to request when valid session', async () => {
      const sessionId = 'valid_session_id';
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);
      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: mockUser,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockRequest.session).toEqual(mockSession);
    });

    it('should throw UnauthorizedException when no session cookie', async () => {
      const cookieName = 'session_id';

      mockRequest.cookies = {}; // No cookies
      sessionCookieService.getCookieName.mockReturnValue(cookieName);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockRequest.session).toBeUndefined();
    });

    it('should throw UnauthorizedException when session cookie is undefined', async () => {
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: undefined };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when session validation fails', async () => {
      const sessionId = 'invalid_session_id';
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);
      sessionValidatorService.validate.mockResolvedValue({
        session: null,
        user: null,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.user).toBeUndefined();
      expect(mockRequest.session).toBeUndefined();
    });

    it('should throw UnauthorizedException when session validation returns null session', async () => {
      const sessionId = 'expired_session_id';
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);
      sessionValidatorService.validate.mockResolvedValue({
        session: null,
        user: null,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
    });

    it('should handle validation service throwing an error', async () => {
      const sessionId = 'error_session_id';
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);
      sessionValidatorService.validate.mockRejectedValue(
        new Error('Validation service error'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Validation service error',
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
    });

    it('should work with different cookie names', async () => {
      const sessionId = 'custom_session_id';
      const customCookieName = 'custom_auth_cookie';

      mockRequest.cookies = { [customCookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(customCookieName);
      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: mockUser,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
    });

    it('should handle empty session cookie value', async () => {
      const cookieName = 'session_id';

      mockRequest.cookies = { [cookieName]: '' };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionValidatorService.validate).not.toHaveBeenCalled();
    });

    it('should return true for public endpoints without authentication', async () => {
      reflector.getAllAndOverride.mockReturnValue(true); // Public endpoint

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
      expect(sessionCookieService.getCookieName).not.toHaveBeenCalled();
      expect(sessionValidatorService.validate).not.toHaveBeenCalled();
    });
  });
});
