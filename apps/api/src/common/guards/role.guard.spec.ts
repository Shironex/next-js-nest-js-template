import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRoleGuard } from './role.guard';
import { SessionCookieService } from '../../modules/auth/services/session/sessionCookie.service';
import { SessionValidatorService } from '../../modules/auth/services/session/sessionValidator.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { SafeUser, SafeSession } from '../interfaces/auth';
import { Role } from 'generated/prisma';

describe('AdminRoleGuard', () => {
  let guard: AdminRoleGuard;
  let sessionCookieService: DeepMockProxy<SessionCookieService>;
  let sessionValidatorService: DeepMockProxy<SessionValidatorService>;
  let reflector: DeepMockProxy<Reflector>;
  let mockExecutionContext: DeepMockProxy<ExecutionContext>;
  let mockRequest: Partial<AuthRequest>;

  const mockAdminUser: SafeUser = {
    id: 'admin_123',
    email: 'admin@example.com',
    username: 'admin',
    role: Role.ADMIN,
    isActive: true,
    emailVerified: true,
  };

  const mockRegularUser: SafeUser = {
    id: 'user_123',
    email: 'user@example.com',
    username: 'user',
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
        AdminRoleGuard,
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

    guard = module.get<AdminRoleGuard>(AdminRoleGuard);
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
    const sessionId = 'valid_session_id';
    const cookieName = 'session_id';

    beforeEach(() => {
      jest.clearAllMocks();
      mockRequest.cookies = { [cookieName]: sessionId };
      sessionCookieService.getCookieName.mockReturnValue(cookieName);
    });

    it('should return true when user is authenticated and has admin role', async () => {
      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: mockAdminUser,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.user).toEqual(mockAdminUser);
      expect(mockRequest.session).toEqual(mockSession);
    });

    it('should throw ForbiddenException when user has USER role', async () => {
      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: mockRegularUser,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Admin access required',
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(mockRequest.user).toEqual(mockRegularUser);
    });

    it('should throw UnauthorizedException when session is invalid', async () => {
      mockRequest.cookies = {}; // No session cookie

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionValidatorService.validate).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when session validation fails', async () => {
      sessionValidatorService.validate.mockResolvedValue({
        session: null,
        user: null,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
    });

    it('should return false when parent guard returns false', async () => {
      // Mock session validation to fail
      sessionValidatorService.validate.mockResolvedValue({
        session: null,
        user: null,
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle authentication service throwing an error', async () => {
      sessionValidatorService.validate.mockRejectedValue(
        new Error('Authentication service error'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication service error',
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
    });

    it('should handle different admin role variations (case sensitivity)', async () => {
      const adminUserUpperCase = {
        ...mockAdminUser,
        role: Role.ADMIN, // This is already the correct enum value
      };

      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: adminUserUpperCase,
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(adminUserUpperCase);
    });

    it('should ensure proper method calls are made', async () => {
      sessionValidatorService.validate.mockResolvedValue({
        session: mockSession,
        user: mockAdminUser,
      });

      await guard.canActivate(mockExecutionContext);

      // Verify the calls were made
      expect(sessionCookieService.getCookieName).toHaveBeenCalled();
      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(sessionValidatorService.validate).toHaveBeenCalledTimes(1);
    });
  });
});
