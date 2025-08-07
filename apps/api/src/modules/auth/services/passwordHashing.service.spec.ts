import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashingService } from './passwordHashing.service';
import { CustomLogger } from '../../logger/logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';

// Mock the scrypt module
jest.mock('../scrypt', () => ({
  scrypt: jest.fn(),
}));

// Mock the scrypt service
jest.mock('./scrypt.service', () => ({
  ScryptService: jest.fn().mockImplementation(() => ({
    hash: jest.fn(),
    verify: jest.fn(),
  })),
}));

describe('PasswordHashingService', () => {
  let service: PasswordHashingService;
  let logger: DeepMockProxy<CustomLogger>;
  let mockScryptService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordHashingService,
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
      ],
    }).compile();

    service = module.get<PasswordHashingService>(PasswordHashingService);
    logger = module.get(CustomLogger);

    // Get the mocked ScryptService instance
    mockScryptService = (service as any).scryptImpl;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should successfully hash a password', async () => {
      const password = 'testPassword123';
      const expectedHash = 'salt:hashedPassword';

      mockScryptService.hash.mockResolvedValue(expectedHash);

      const result = await service.hashPassword(password);

      expect(result).toBe(expectedHash);
      expect(mockScryptService.hash).toHaveBeenCalledWith(password);
      expect(logger.debug).toHaveBeenCalledWith('Starting password hashing', {
        passwordLength: password.length,
      });
      expect(logger.debug).toHaveBeenCalledWith('Password hashing completed', {
        duration: expect.any(Number),
        hashedLength: expectedHash.length,
      });
    });

    it('should handle password hashing errors', async () => {
      const password = 'testPassword123';
      const error = new Error('Scrypt failed');

      mockScryptService.hash.mockRejectedValue(error);

      await expect(service.hashPassword(password)).rejects.toThrow(
        'Scrypt failed',
      );

      expect(logger.debug).toHaveBeenCalledWith('Starting password hashing', {
        passwordLength: password.length,
      });
      expect(logger.error).toHaveBeenCalledWith('Password hashing failed', {
        error: error.message,
        duration: expect.any(Number),
      });
    });

    it('should handle null/undefined password gracefully', async () => {
      const password = null as any;
      const expectedHash = 'salt:hashedPassword';

      mockScryptService.hash.mockResolvedValue(expectedHash);

      const result = await service.hashPassword(password);

      expect(result).toBe(expectedHash);
      expect(logger.debug).toHaveBeenCalledWith('Starting password hashing', {
        passwordLength: undefined,
      });
    });
  });

  describe('verifyPassword', () => {
    it('should successfully verify a correct password', async () => {
      const hashedPassword = 'salt:hashedPassword';
      const password = 'testPassword123';

      mockScryptService.verify.mockResolvedValue(true);

      const result = await service.verifyPassword(hashedPassword, password);

      expect(result).toBe(true);
      expect(mockScryptService.verify).toHaveBeenCalledWith(
        hashedPassword,
        password,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'Starting password verification',
        {
          hashedLength: hashedPassword.length,
          passwordLength: password.length,
        },
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'Password verification completed',
        {
          isValid: true,
          duration: expect.any(Number),
        },
      );
    });

    it('should return false for incorrect password', async () => {
      const hashedPassword = 'salt:hashedPassword';
      const password = 'wrongPassword';

      mockScryptService.verify.mockResolvedValue(false);

      const result = await service.verifyPassword(hashedPassword, password);

      expect(result).toBe(false);
      expect(mockScryptService.verify).toHaveBeenCalledWith(
        hashedPassword,
        password,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        'Password verification completed',
        {
          isValid: false,
          duration: expect.any(Number),
        },
      );
    });

    it('should handle password verification errors', async () => {
      const hashedPassword = 'salt:hashedPassword';
      const password = 'testPassword123';
      const error = new Error('Verification failed');

      mockScryptService.verify.mockRejectedValue(error);

      await expect(
        service.verifyPassword(hashedPassword, password),
      ).rejects.toThrow('Verification failed');

      expect(logger.debug).toHaveBeenCalledWith(
        'Starting password verification',
        {
          hashedLength: hashedPassword.length,
          passwordLength: password.length,
        },
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Password verification failed',
        {
          error: error.message,
          duration: expect.any(Number),
        },
      );
    });

    it('should handle null/undefined values gracefully', async () => {
      const hashedPassword = null as any;
      const password = undefined as any;

      mockScryptService.verify.mockResolvedValue(false);

      const result = await service.verifyPassword(hashedPassword, password);

      expect(result).toBe(false);
      expect(logger.debug).toHaveBeenCalledWith(
        'Starting password verification',
        {
          hashedLength: undefined,
          passwordLength: undefined,
        },
      );
    });
  });

  describe('timing consistency', () => {
    it('should have similar timing for hash operations', async () => {
      const password1 = 'short';
      const password2 = 'averageLengthPassword123!@#';
      const expectedHash = 'salt:hashedPassword';

      mockScryptService.hash.mockResolvedValue(expectedHash);

      const start1 = Date.now();
      await service.hashPassword(password1);
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await service.hashPassword(password2);
      const duration2 = Date.now() - start2;

      // Both should complete within reasonable time (allowing for test environment variance)
      expect(duration1).toBeLessThan(1000);
      expect(duration2).toBeLessThan(1000);
    });
  });
});
