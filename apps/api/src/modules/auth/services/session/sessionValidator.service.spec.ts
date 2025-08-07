import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SessionValidatorService } from './sessionValidator.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { SessionValidationResult } from './session.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('SessionValidatorService', () => {
  let service: SessionValidatorService;
  let prismaService: DeepMockProxy<PrismaService>;
  let configService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<any>;

  const mockConfig = {
    SESSION_DURATION_DAYS: 7,
    SESSION_REFRESH_THRESHOLD_DAYS: 1,
    SESSION_MAX_COUNT: 5,
  };

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: 'USER' as any,
    isActive: true,
    emailVerified: true,
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    lockedUntil: null,
    lastPasswordChangeAt: null,
    passwordChangeCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockSession = {
    id: 'session_123',
    userId: 'user_123',
    userAgent: 'Mozilla/5.0',
    ipAddress: '127.0.0.1',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-03'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  };

  const mockSessionWithUser = {
    ...mockSession,
    user: mockUser,
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
        SessionValidatorService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => mockConfig[key]),
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

    service = module.get<SessionValidatorService>(SessionValidatorService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should load configuration values correctly', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'SESSION_DURATION_DAYS',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'SESSION_REFRESH_THRESHOLD_DAYS',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'SESSION_MAX_COUNT',
      );
    });
  });

  describe('validate', () => {
    const sessionId = 'session_123';

    it('should return valid session and user when session is valid', async () => {
      prismaService.session.findUnique.mockResolvedValue(
        mockSessionWithUser as any,
      );

      const result = await service.validate(sessionId);

      expect(result).toEqual({
        session: {
          id: mockSession.id,
          createdAt: mockSession.createdAt,
          expiresAt: mockSession.expiresAt,
        },
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          role: mockUser.role,
          isActive: mockUser.isActive,
          emailVerified: mockUser.emailVerified,
        },
      });

      expect(prismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: {
          user: {
            omit: {},
          },
        },
      });
    });

    it('should return null result when session not found', async () => {
      prismaService.session.findUnique.mockResolvedValue(null);

      const result = await service.validate(sessionId);

      expect(result).toEqual({ session: null, user: null });
    });

    it('should return null result when session has no user', async () => {
      const sessionWithoutUser = { ...mockSession, user: null };
      prismaService.session.findUnique.mockResolvedValue(
        sessionWithoutUser as any,
      );

      const result = await service.validate(sessionId);

      expect(result).toEqual({ session: null, user: null });
    });

    it('should delete and return null result when session is expired', async () => {
      const expiredSession = {
        ...mockSessionWithUser,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };
      prismaService.session.findUnique.mockResolvedValue(expiredSession as any);
      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.session.delete.mockResolvedValue(expiredSession as any);

      const result = await service.validate(sessionId);

      expect(result).toEqual({ session: null, user: null });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
    });

    it('should refresh session when near expiration threshold', async () => {
      const nearExpirySession = {
        ...mockSessionWithUser,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now (within 1 day threshold)
      };
      prismaService.session.findUnique.mockResolvedValue(
        nearExpirySession as any,
      );
      prismaService.session.update.mockResolvedValue(nearExpirySession as any);

      const result = await service.validate(sessionId);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          expiresAt: expect.any(Date),
        },
      });
      expect(result.session).toBeTruthy();
      expect(result.user).toBeTruthy();
    });

    it('should update activity when last updated more than 5 minutes ago', async () => {
      const oldActivitySession = {
        ...mockSessionWithUser,
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };
      prismaService.session.findUnique.mockResolvedValue(
        oldActivitySession as any,
      );
      prismaService.session.update.mockResolvedValue(oldActivitySession as any);

      const result = await service.validate(sessionId);

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          updatedAt: expect.any(Date),
        },
      });
      expect(result.session).toBeTruthy();
      expect(result.user).toBeTruthy();
    });

    it('should not update activity when last updated within 5 minutes', async () => {
      const recentActivitySession = {
        ...mockSessionWithUser,
        updatedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      };
      prismaService.session.findUnique.mockResolvedValue(
        recentActivitySession as any,
      );

      const result = await service.validate(sessionId);

      // Should not call update for activity
      expect(prismaService.session.update).not.toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          updatedAt: expect.any(Date),
        },
      });
      expect(result.session).toBeTruthy();
      expect(result.user).toBeTruthy();
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.session.findUnique.mockRejectedValue(dbError);

      const result = await service.validate(sessionId);

      expect(result).toEqual({ session: null, user: null });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error validating session',
        dbError,
      );
    });

    it('should handle both refresh and activity update when both are needed', async () => {
      const sessionNeedingBoth = {
        ...mockSessionWithUser,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours (within refresh threshold)
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago (needs activity update)
      };
      prismaService.session.findUnique.mockResolvedValue(
        sessionNeedingBoth as any,
      );
      prismaService.session.update.mockResolvedValue(sessionNeedingBoth as any);

      const result = await service.validate(sessionId);

      // Should call update twice - once for refresh, once for activity
      expect(prismaService.session.update).toHaveBeenCalledTimes(2);
      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          expiresAt: expect.any(Date),
        },
      });
      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          updatedAt: expect.any(Date),
        },
      });
      expect(result.session).toBeTruthy();
      expect(result.user).toBeTruthy();
    });
  });

  describe('enforceSessionLimit', () => {
    const userId = 'user_123';

    it('should not delete sessions when under limit', async () => {
      const sessionCount = 3; // Under limit of 5
      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.session.count.mockResolvedValue(sessionCount);

      await service.enforceSessionLimit(userId);

      expect(prismaService.session.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prismaService.session.findFirst).not.toHaveBeenCalled();
      expect(prismaService.session.delete).not.toHaveBeenCalled();
    });

    it('should delete oldest session when at limit', async () => {
      const sessionCount = 5; // At limit
      const oldestSession = {
        id: 'oldest_session',
        userId,
        createdAt: new Date('2025-07-01'),
        userAgent: 'Old Agent',
        ipAddress: '192.168.1.1',
        updatedAt: new Date('2025-07-01'),
        expiresAt: new Date('2025-07-08'),
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.session.count.mockResolvedValue(sessionCount);
      prismaService.session.findFirst.mockResolvedValue(oldestSession as any);
      prismaService.session.delete.mockResolvedValue(oldestSession as any);

      await service.enforceSessionLimit(userId);

      expect(prismaService.session.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prismaService.session.findFirst).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: oldestSession.id },
      });
    });

    it('should delete oldest session when over limit', async () => {
      const sessionCount = 7; // Over limit
      const oldestSession = {
        id: 'oldest_session',
        userId,
        createdAt: new Date('2025-07-01'),
        userAgent: 'Old Agent',
        ipAddress: '192.168.1.1',
        updatedAt: new Date('2025-07-01'),
        expiresAt: new Date('2025-07-08'),
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.session.count.mockResolvedValue(sessionCount);
      prismaService.session.findFirst.mockResolvedValue(oldestSession as any);
      prismaService.session.delete.mockResolvedValue(oldestSession as any);

      await service.enforceSessionLimit(userId);

      expect(prismaService.session.delete).toHaveBeenCalledWith({
        where: { id: oldestSession.id },
      });
    });

    it('should handle case when no oldest session is found', async () => {
      const sessionCount = 6; // Over limit
      prismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaService);
      });
      prismaService.session.count.mockResolvedValue(sessionCount);
      prismaService.session.findFirst.mockResolvedValue(null);

      await service.enforceSessionLimit(userId);

      expect(prismaService.session.findFirst).toHaveBeenCalled();
      expect(prismaService.session.delete).not.toHaveBeenCalled();
    });

    it('should handle transaction errors', async () => {
      const transactionError = new Error('Transaction failed');
      prismaService.$transaction.mockRejectedValue(transactionError);

      await expect(service.enforceSessionLimit(userId)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('configuration error handling', () => {
    it('should throw error when SESSION_DURATION_DAYS is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'SESSION_DURATION_DAYS')
            throw new Error('SESSION_DURATION_DAYS is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionValidatorService,
            {
              provide: PrismaService,
              useValue: mockDeep<PrismaService>(),
            },
            {
              provide: ConfigService,
              useValue: faultyConfigService,
            },
            {
              provide: LoggerFactory,
              useValue: {
                createLogger: jest.fn(() => mockLogger),
              },
            },
          ],
        }).compile(),
      ).rejects.toThrow('SESSION_DURATION_DAYS is missing');
    });

    it('should throw error when SESSION_REFRESH_THRESHOLD_DAYS is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'SESSION_REFRESH_THRESHOLD_DAYS')
            throw new Error('SESSION_REFRESH_THRESHOLD_DAYS is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionValidatorService,
            {
              provide: PrismaService,
              useValue: mockDeep<PrismaService>(),
            },
            {
              provide: ConfigService,
              useValue: faultyConfigService,
            },
            {
              provide: LoggerFactory,
              useValue: {
                createLogger: jest.fn(() => mockLogger),
              },
            },
          ],
        }).compile(),
      ).rejects.toThrow('SESSION_REFRESH_THRESHOLD_DAYS is missing');
    });

    it('should throw error when SESSION_MAX_COUNT is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'SESSION_MAX_COUNT')
            throw new Error('SESSION_MAX_COUNT is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionValidatorService,
            {
              provide: PrismaService,
              useValue: mockDeep<PrismaService>(),
            },
            {
              provide: ConfigService,
              useValue: faultyConfigService,
            },
            {
              provide: LoggerFactory,
              useValue: {
                createLogger: jest.fn(() => mockLogger),
              },
            },
          ],
        }).compile(),
      ).rejects.toThrow('SESSION_MAX_COUNT is missing');
    });
  });
});
