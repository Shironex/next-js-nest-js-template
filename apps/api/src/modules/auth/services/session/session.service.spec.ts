import { Test, TestingModule } from '@nestjs/testing';
import { SessionService, SessionValidationResult } from './session.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { SessionTokenService } from './sessionToken.service';
import { SessionCookieService } from './sessionCookie.service';
import { SessionValidatorService } from './sessionValidator.service';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { Request } from 'express';
import {
  Cookie,
  SessionResponse,
  SessionMetadata,
} from 'src/common/interfaces/auth';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('SessionService', () => {
  let service: SessionService;
  let prismaService: DeepMockProxy<PrismaService>;
  let sessionTokenService: jest.Mocked<SessionTokenService>;
  let sessionCookieService: jest.Mocked<SessionCookieService>;
  let sessionValidatorService: jest.Mocked<SessionValidatorService>;
  let mockLogger: jest.Mocked<any>;

  const mockRequest = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    ip: '127.0.0.1',
  } as Request;

  const mockCookie: Cookie = {
    name: 'session',
    value: 'session_token_123',
    attributes: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      expires: new Date(Date.now() + 86400000),
      path: '/',
    },
  };

  const mockSessionResponse: SessionResponse = {
    session: {
      id: 'session_123',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    },
    user: {
      id: 'user_456',
      email: 'test@example.com',
      username: 'testuser',
      role: 'USER' as any,
      isActive: true,
      emailVerified: true,
    },
  };

  beforeEach(async () => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: SessionTokenService,
          useValue: {
            generateToken: jest.fn(),
            hashToken: jest.fn(),
            extractMetadata: jest.fn(),
            calculateExpiry: jest.fn(),
          },
        },
        {
          provide: SessionCookieService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: SessionValidatorService,
          useValue: {
            enforceSessionLimit: jest.fn(),
            validate: jest.fn(),
          },
        },
        {
          provide: LoggerFactory,
          useValue: {
            createLogger: jest.fn(() => mockLogger),
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    prismaService = module.get(PrismaService);
    sessionTokenService = module.get(SessionTokenService);
    sessionCookieService = module.get(SessionCookieService);
    sessionValidatorService = module.get(SessionValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    const userId = 'user_456';
    const token = 'raw_session_token_123';
    const sessionId = 'hashed_session_id_123';
    const expiryDate = new Date(Date.now() + 86400000);
    const metadata: SessionMetadata = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession = {
      id: sessionId,
      userId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      expiresAt: expiryDate,
    };

    beforeEach(() => {
      sessionTokenService.generateToken.mockReturnValue(token);
      sessionTokenService.hashToken.mockReturnValue(sessionId);
      sessionTokenService.extractMetadata.mockReturnValue(metadata);
      sessionTokenService.calculateExpiry.mockReturnValue(expiryDate);
      sessionValidatorService.enforceSessionLimit.mockResolvedValue(undefined);
      prismaService.session.create.mockResolvedValue(mockSession as any);
      sessionCookieService.create.mockReturnValue(mockCookie);
    });

    it('should successfully create a new session', async () => {
      const result = await service.createSession(userId, mockRequest);

      expect(sessionTokenService.generateToken).toHaveBeenCalled();
      expect(sessionTokenService.hashToken).toHaveBeenCalledWith(token);
      expect(sessionTokenService.extractMetadata).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(sessionValidatorService.enforceSessionLimit).toHaveBeenCalledWith(
        userId,
      );

      expect(prismaService.session.create).toHaveBeenCalledWith({
        data: {
          id: sessionId,
          userId,
          ...metadata,
          expiresAt: expiryDate,
        },
      });

      expect(sessionCookieService.create).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockCookie);

      expect(mockLogger.debug).toHaveBeenCalledWith('Creating new session', {
        userId,
        sessionId,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Session created successfully',
        {
          userId,
          sessionId,
          expiresAt: expiryDate,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
        },
      );
    });

    it('should handle session limit enforcement errors', async () => {
      const limitError = new Error('Session limit exceeded');
      sessionValidatorService.enforceSessionLimit.mockRejectedValue(limitError);

      await expect(service.createSession(userId, mockRequest)).rejects.toThrow(
        'Session limit exceeded',
      );

      expect(sessionValidatorService.enforceSessionLimit).toHaveBeenCalledWith(
        userId,
      );
      expect(prismaService.session.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during session creation', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.session.create.mockRejectedValue(dbError);

      await expect(service.createSession(userId, mockRequest)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.session.create).toHaveBeenCalled();
      expect(sessionCookieService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateSession', () => {
    const sessionId = 'session_123';

    it('should successfully validate a session', async () => {
      sessionValidatorService.validate.mockResolvedValue(mockSessionResponse);

      const result = await service.validateSession(sessionId);

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(mockSessionResponse);
      expect(mockLogger.debug).toHaveBeenCalledWith('Validating session', {
        sessionId,
      });
    });

    it('should return null session and user when validation fails', async () => {
      const invalidResult = { session: null, user: null };
      sessionValidatorService.validate.mockResolvedValue(invalidResult);

      const result = await service.validateSession(sessionId);

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual(invalidResult);
      expect(mockLogger.debug).toHaveBeenCalledWith('Validating session', {
        sessionId,
      });
    });

    it('should handle validation service errors', async () => {
      const validationError = new Error('Validation service error');
      sessionValidatorService.validate.mockRejectedValue(validationError);

      await expect(service.validateSession(sessionId)).rejects.toThrow(
        'Validation service error',
      );

      expect(sessionValidatorService.validate).toHaveBeenCalledWith(sessionId);
      expect(mockLogger.debug).toHaveBeenCalledWith('Validating session', {
        sessionId,
      });
    });
  });

  describe('invalidateSession', () => {
    const sessionId = 'session_123';

    it('should successfully invalidate a session', async () => {
      const mockDeletedSession = {
        id: sessionId,
        userId: 'user_456',
        userAgent: 'MockAgent',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
      };
      prismaService.session.delete.mockResolvedValue(mockDeletedSession as any);

      await service.invalidateSession(sessionId);

      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Invalidating session', {
        sessionId,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Session invalidated successfully',
        { sessionId },
      );
    });

    it('should handle session not found during invalidation', async () => {
      const notFoundError = new Error('Session not found');
      prismaService.session.delete.mockRejectedValue(notFoundError);

      await service.invalidateSession(sessionId);

      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith('Invalidating session', {
        sessionId,
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to invalidate session - may not exist',
        {
          sessionId,
          error: notFoundError.message,
        },
      );
    });

    it('should handle database errors during invalidation', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.session.delete.mockRejectedValue(dbError);

      await service.invalidateSession(sessionId);

      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to invalidate session - may not exist',
        {
          sessionId,
          error: dbError.message,
        },
      );
    });
  });

  describe('invalidateAllUserSessions', () => {
    const userId = 'user_456';

    it('should successfully invalidate all user sessions', async () => {
      const deleteResult = { count: 3 };
      prismaService.session.deleteMany.mockResolvedValue(deleteResult);

      await service.invalidateAllUserSessions(userId);

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Invalidating all user sessions',
        { userId },
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'All user sessions invalidated',
        {
          userId,
          deletedCount: deleteResult.count,
        },
      );
    });

    it('should handle no sessions to delete', async () => {
      const deleteResult = { count: 0 };
      prismaService.session.deleteMany.mockResolvedValue(deleteResult);

      await service.invalidateAllUserSessions(userId);

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'All user sessions invalidated',
        {
          userId,
          deletedCount: 0,
        },
      );
    });

    it('should handle database errors during bulk invalidation', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.session.deleteMany.mockRejectedValue(dbError);

      await expect(service.invalidateAllUserSessions(userId)).rejects.toThrow(
        'Database connection failed',
      );

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Invalidating all user sessions',
        { userId },
      );
    });
  });
});
