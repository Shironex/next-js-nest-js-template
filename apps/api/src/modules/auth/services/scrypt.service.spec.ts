import { ScryptService } from './scrypt.service';

describe('ScryptService', () => {
  let service: ScryptService;
  let mockGenerateScryptKey: jest.Mock;

  beforeEach(() => {
    mockGenerateScryptKey = jest.fn();
    service = new ScryptService(mockGenerateScryptKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should generate a hash with salt and key', async () => {
      const password = 'testPassword123';
      const mockKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      // Mock crypto.getRandomValues to return predictable salt
      const mockSalt = new Uint8Array([
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
      ]);
      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: jest.fn().mockReturnValue(mockSalt),
        },
      });

      const result = await service.hash(password);

      expect(result).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/); // salt:key format
      expect(mockGenerateScryptKey).toHaveBeenCalledWith(
        password.normalize('NFKC'),
        expect.any(String), // hex-encoded salt
      );
    });

    it('should normalize password using NFKC', async () => {
      const password = 'tëst'; // Contains accented character
      const mockKey = new Uint8Array([1, 2, 3, 4]);

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      // Mock crypto.getRandomValues
      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: jest.fn().mockReturnValue(new Uint8Array(16)),
        },
      });

      await service.hash(password);

      expect(mockGenerateScryptKey).toHaveBeenCalledWith(
        password.normalize('NFKC'),
        expect.any(String),
      );
    });

    it('should handle empty password', async () => {
      const password = '';
      const mockKey = new Uint8Array([1, 2, 3, 4]);

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: jest.fn().mockReturnValue(new Uint8Array(16)),
        },
      });

      const result = await service.hash(password);

      expect(result).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/);
      expect(mockGenerateScryptKey).toHaveBeenCalledWith(
        '',
        expect.any(String),
      );
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123';
      const salt = '0a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
      const keyHex = '0102030405060708';
      const hash = `${salt}:${keyHex}`;
      const mockKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      const result = await service.verify(hash, password);

      expect(result).toBe(true);
      expect(mockGenerateScryptKey).toHaveBeenCalledWith(
        password.normalize('NFKC'),
        salt,
      );
    });

    it('should return false for incorrect password', async () => {
      const password = 'wrongPassword';
      const salt = '0a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
      const keyHex = '0102030405060708';
      const hash = `${salt}:${keyHex}`;
      const mockKey = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]); // Different key

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      const result = await service.verify(hash, password);

      expect(result).toBe(false);
    });

    it('should return false for malformed hash (no colon)', async () => {
      const password = 'testPassword123';
      const hash = 'malformedhash';

      const result = await service.verify(hash, password);

      expect(result).toBe(false);
      expect(mockGenerateScryptKey).not.toHaveBeenCalled();
    });

    it('should return false for malformed hash (multiple colons)', async () => {
      const password = 'testPassword123';
      const hash = 'salt:key:extra';

      const result = await service.verify(hash, password);

      expect(result).toBe(false);
      expect(mockGenerateScryptKey).not.toHaveBeenCalled();
    });

    it('should return false for empty hash', async () => {
      const password = 'testPassword123';
      const hash = '';

      const result = await service.verify(hash, password);

      expect(result).toBe(false);
      expect(mockGenerateScryptKey).not.toHaveBeenCalled();
    });

    it('should normalize password during verification', async () => {
      const password = 'tëst'; // Contains accented character
      const salt = '0a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
      const keyHex = '0102030405060708';
      const hash = `${salt}:${keyHex}`;
      const mockKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

      mockGenerateScryptKey.mockResolvedValue(mockKey);

      await service.verify(hash, password);

      expect(mockGenerateScryptKey).toHaveBeenCalledWith(
        password.normalize('NFKC'),
        salt,
      );
    });

    it('should handle errors from generateScryptKey', async () => {
      const password = 'testPassword123';
      const salt = '0a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
      const keyHex = '0102030405060708';
      const hash = `${salt}:${keyHex}`;

      mockGenerateScryptKey.mockRejectedValue(
        new Error('Scrypt generation failed'),
      );

      await expect(service.verify(hash, password)).rejects.toThrow(
        'Scrypt generation failed',
      );
    });
  });

  describe('integration', () => {
    it('should hash and verify the same password successfully', async () => {
      // Use real crypto for this integration test
      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: (array: Uint8Array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = Math.floor(Math.random() * 256);
            }
            return array;
          },
        },
      });

      // Create a service with a mock that returns consistent results for the same input
      const keyCache = new Map<string, Uint8Array>();
      const mockGenerateKey = jest
        .fn()
        .mockImplementation(async (password: string, salt: string) => {
          const cacheKey = `${password}:${salt}`;
          if (!keyCache.has(cacheKey)) {
            // Generate a deterministic key based on password and salt
            const key = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
              key[i] =
                (password.charCodeAt(i % password.length) +
                  salt.charCodeAt(i % salt.length)) %
                256;
            }
            keyCache.set(cacheKey, key);
          }
          return keyCache.get(cacheKey)!;
        });

      const integrationService = new ScryptService(mockGenerateKey);
      const password = 'testPassword123';

      const hash = await integrationService.hash(password);
      const isValid = await integrationService.verify(hash, password);
      const isInvalid = await integrationService.verify(hash, 'wrongPassword');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
      expect(hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]+$/);
    });
  });
});
