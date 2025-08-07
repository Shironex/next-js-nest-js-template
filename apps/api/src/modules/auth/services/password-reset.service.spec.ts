import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { User, PasswordResetToken, Role } from 'generated/prisma';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let prismaService: DeepMockProxy<PrismaService>;
  let configService: DeepMockProxy<ConfigService>;
  let logger: DeepMockProxy<CustomLogger>;

  const mockUser: User = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);
    logger = module.get(CustomLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createResetToken', () => {
    it('should create and return a reset token', async () => {
      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token: 'generated-token-123',
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      prismaService.passwordResetToken.create.mockResolvedValue(mockResetToken);

      const result = await service.createResetToken(mockUser);

      expect(prismaService.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          token: expect.any(String),
          User: {
            connect: {
              id: mockUser.id,
            },
          },
          expiresAt: expect.any(Date),
        },
      });

      expect(result).toEqual(mockResetToken);
      expect(logger.info).toHaveBeenCalledWith('Password reset token created', {
        resetTokenId: mockResetToken.id,
        userId: mockUser.id,
      });
    });

    it('should handle token creation failure', async () => {
      const error = new Error('Database error');
      prismaService.passwordResetToken.create.mockRejectedValue(error);

      await expect(service.createResetToken(mockUser)).rejects.toThrow(error);
    });
  });

  describe('findAndDeleteResetToken', () => {
    it('should find and delete the reset token', async () => {
      const token = 'test-token-123';
      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token,
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          passwordResetToken: {
            findUnique: jest.fn().mockResolvedValue(mockResetToken),
            delete: jest.fn().mockResolvedValue(mockResetToken),
          },
        });
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      const result = await service.findAndDeleteResetToken(token);

      expect(result).toEqual(mockResetToken);
    });

    it('should return null if token not found', async () => {
      const token = 'non-existent-token';

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return callback({
          passwordResetToken: {
            findUnique: jest.fn().mockResolvedValue(null),
            delete: jest.fn(),
          },
        });
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      const result = await service.findAndDeleteResetToken(token);

      expect(result).toBeNull();
    });

    it('should handle transaction failure', async () => {
      const error = new Error('Transaction failed');
      prismaService.$transaction.mockRejectedValue(error);

      await expect(service.findAndDeleteResetToken('token')).rejects.toThrow(
        error,
      );
    });
  });

  describe('findLastSentToken', () => {
    it('should find the last sent token for user', async () => {
      const userId = 'user_123';
      const mockResetToken: PasswordResetToken = {
        id: 'reset_123',
        token: 'last-token',
        userId,
        expiresAt: new Date(Date.now() + 3600000),
      };

      prismaService.passwordResetToken.findFirst.mockResolvedValue(
        mockResetToken,
      );

      const result = await service.findLastSentToken(userId);

      expect(prismaService.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockResetToken);
    });

    it('should return null if no token found', async () => {
      const userId = 'user_123';
      prismaService.passwordResetToken.findFirst.mockResolvedValue(null);

      const result = await service.findLastSentToken(userId);

      expect(result).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', () => {
      const validToken: PasswordResetToken = {
        id: 'reset_123',
        token: 'valid-token',
        userId: 'user_123',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour in future
      };

      const result = service.isTokenValid(validToken);

      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const expiredToken: PasswordResetToken = {
        id: 'reset_123',
        token: 'expired-token',
        userId: 'user_123',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour in past
      };

      const result = service.isTokenValid(expiredToken);

      expect(result).toBe(false);
    });

    it('should return false for null token', () => {
      const result = service.isTokenValid(null);

      expect(result).toBe(false);
    });
  });

  describe('generateResetLink', () => {
    it('should generate reset link with correct format', () => {
      const token = 'test-token-123';
      const frontendUrl = 'https://example.com';

      configService.getOrThrow.mockReturnValue(frontendUrl);

      const result = service.generateResetLink(token);

      expect(configService.getOrThrow).toHaveBeenCalledWith('FRONTEND_URL');
      expect(result).toBe(`${frontendUrl}/auth/reset-password?token=${token}`);
    });

    it('should handle different tokens correctly', () => {
      const tokens = ['token1', 'token2', 'very-long-token-123'];
      const frontendUrl = 'https://example.com';

      configService.getOrThrow.mockReturnValue(frontendUrl);

      tokens.forEach((token) => {
        const result = service.generateResetLink(token);
        expect(result).toBe(
          `${frontendUrl}/auth/reset-password?token=${token}`,
        );
      });
    });
  });
});
