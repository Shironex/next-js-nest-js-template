import { Test, TestingModule } from '@nestjs/testing';
import { VerificationCodeService } from './verificationCode.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLogger } from '../../logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { User, EmailVerificationCode, Role } from 'generated/prisma';

// Mock the utils
jest.mock('../../../common/utils', () => ({
  TimeSpan: jest.fn().mockImplementation((value: number, unit: string) => ({
    value,
    unit,
  })),
  createDate: jest.fn().mockImplementation((timeSpan: any) => {
    const now = new Date();
    return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  }),
  isWithinExpirationDate: jest.fn(),
  alphabet: jest.fn().mockReturnValue('0123456789'),
  generateRandomString: jest.fn(),
}));

describe('VerificationCodeService', () => {
  let service: VerificationCodeService;
  let prisma: DeepMockProxy<PrismaService>;
  let logger: DeepMockProxy<CustomLogger>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    username: 'testuser',
    role: Role.USER,
    isActive: true,
    emailVerified: false,
    lastPasswordChangeAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVerificationCode: EmailVerificationCode = {
    id: 'code-123',
    code: '12345678',
    email: 'test@example.com',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationCodeService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
      ],
    }).compile();

    service = module.get<VerificationCodeService>(VerificationCodeService);
    prisma = module.get(PrismaService);
    logger = module.get(CustomLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEmailVerificationCode', () => {
    it('should create a new verification code', async () => {
      const { generateRandomString } = require('../../../common/utils');
      const expectedCode = '12345678';

      generateRandomString.mockReturnValue(expectedCode);
      prisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 0 });
      prisma.emailVerificationCode.create.mockResolvedValue(
        mockVerificationCode,
      );

      const result = await service.createEmailVerificationCode(mockUser);

      expect(result).toBe(expectedCode);
      expect(generateRandomString).toHaveBeenCalledWith(8, '0123456789');
      expect(prisma.emailVerificationCode.deleteMany).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(prisma.emailVerificationCode.create).toHaveBeenCalledWith({
        data: {
          code: expectedCode,
          User: { connect: { id: mockUser.id } },
          email: mockUser.email,
          expiresAt: expect.any(Date),
        },
      });
      expect(logger.info).toHaveBeenCalledWith(
        'Email verification code created',
        {
          verificationCodeId: mockVerificationCode.id,
          code: mockVerificationCode.code,
        },
      );
    });

    it('should delete existing verification codes before creating new one', async () => {
      const { generateRandomString } = require('../../../common/utils');
      generateRandomString.mockReturnValue('87654321');

      prisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 2 });
      prisma.emailVerificationCode.create.mockResolvedValue({
        ...mockVerificationCode,
        code: '87654321',
      });

      await service.createEmailVerificationCode(mockUser);

      expect(prisma.emailVerificationCode.deleteMany).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(prisma.emailVerificationCode.create).toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const { generateRandomString } = require('../../../common/utils');
      generateRandomString.mockReturnValue('12345678');

      prisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 0 });
      prisma.emailVerificationCode.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.createEmailVerificationCode(mockUser),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAndDeleteVerificationCode', () => {
    it('should find and delete verification code in transaction', async () => {
      const userId = 'user-123';
      const code = '12345678';

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          emailVerificationCode: {
            findUnique: jest.fn().mockResolvedValue(mockVerificationCode),
            delete: jest.fn().mockResolvedValue(mockVerificationCode),
          },
        };
        return callback(tx);
      });

      (prisma.$transaction as any) = mockTransaction;

      const result = await service.findAndDeleteVerificationCode(userId, code);

      expect(result).toEqual(mockVerificationCode);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should return null if code not found', async () => {
      const userId = 'user-123';
      const code = 'invalid-code';

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          emailVerificationCode: {
            findUnique: jest.fn().mockResolvedValue(null),
            delete: jest.fn(),
          },
        };
        return callback(tx);
      });

      (prisma.$transaction as any) = mockTransaction;

      const result = await service.findAndDeleteVerificationCode(userId, code);

      expect(result).toBeNull();
    });

    it('should handle transaction errors', async () => {
      const userId = 'user-123';
      const code = '12345678';

      (prisma.$transaction as any) = jest
        .fn()
        .mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.findAndDeleteVerificationCode(userId, code),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('isCodeValid', () => {
    beforeEach(() => {
      const { isWithinExpirationDate } = require('../../../common/utils');
      isWithinExpirationDate.mockReturnValue(true);
    });

    it('should return true for valid code', () => {
      const userId = 'user-123';
      const code = '12345678';

      const result = service.isCodeValid(mockVerificationCode, userId, code);

      expect(result).toBe(true);
    });

    it('should return false if verification code is null', () => {
      const userId = 'user-123';
      const code = '12345678';

      const result = service.isCodeValid(null as any, userId, code);

      expect(result).toBe(false);
    });

    it('should return false if code does not match', () => {
      const userId = 'user-123';
      const code = 'wrong-code';

      const result = service.isCodeValid(mockVerificationCode, userId, code);

      expect(result).toBe(false);
    });

    it('should return false if userId does not match', () => {
      const userId = 'different-user';
      const code = '12345678';

      const result = service.isCodeValid(mockVerificationCode, userId, code);

      expect(result).toBe(false);
    });

    it('should return false if code is expired', () => {
      const { isWithinExpirationDate } = require('../../../common/utils');
      isWithinExpirationDate.mockReturnValue(false);

      const userId = 'user-123';
      const code = '12345678';

      const result = service.isCodeValid(mockVerificationCode, userId, code);

      expect(result).toBe(false);
      expect(isWithinExpirationDate).toHaveBeenCalledWith(
        mockVerificationCode.expiresAt,
      );
    });

    it('should handle edge cases with empty strings', () => {
      const userId = '';
      const code = '';
      const emptyVerificationCode = {
        ...mockVerificationCode,
        code: '',
        userId: '',
      };

      const result = service.isCodeValid(emptyVerificationCode, userId, code);

      expect(result).toBe(true); // All match and not expired
    });

    it('should validate expiration date correctly', () => {
      const { isWithinExpirationDate } = require('../../../common/utils');
      const userId = 'user-123';
      const code = '12345678';

      // Test with expired code
      isWithinExpirationDate.mockReturnValue(false);
      let result = service.isCodeValid(mockVerificationCode, userId, code);
      expect(result).toBe(false);

      // Test with valid code
      isWithinExpirationDate.mockReturnValue(true);
      result = service.isCodeValid(mockVerificationCode, userId, code);
      expect(result).toBe(true);

      expect(isWithinExpirationDate).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete verification flow', async () => {
      const {
        generateRandomString,
        isWithinExpirationDate,
      } = require('../../../common/utils');
      const code = '12345678';

      generateRandomString.mockReturnValue(code);
      isWithinExpirationDate.mockReturnValue(true);

      // Create code
      prisma.emailVerificationCode.deleteMany.mockResolvedValue({ count: 0 });
      prisma.emailVerificationCode.create.mockResolvedValue(
        mockVerificationCode,
      );

      const createdCode = await service.createEmailVerificationCode(mockUser);
      expect(createdCode).toBe(code);

      // Validate code
      const isValid = service.isCodeValid(
        mockVerificationCode,
        mockUser.id,
        code,
      );
      expect(isValid).toBe(true);

      // Find and delete code
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const tx = {
          emailVerificationCode: {
            findUnique: jest.fn().mockResolvedValue(mockVerificationCode),
            delete: jest.fn().mockResolvedValue(mockVerificationCode),
          },
        };
        return callback(tx);
      });
      (prisma.$transaction as any) = mockTransaction;

      const foundCode = await service.findAndDeleteVerificationCode(
        mockUser.id,
        code,
      );
      expect(foundCode).toEqual(mockVerificationCode);
    });
  });
});
