import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SessionTokenService } from './sessionToken.service';
import { Request } from 'express';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';

describe('SessionTokenService', () => {
  let service: SessionTokenService;
  let configService: DeepMockProxy<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionTokenService,
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
      ],
    }).compile();

    service = module.get<SessionTokenService>(SessionTokenService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a token of length 21', () => {
      const token = service.generateToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(21);
    });

    it('should generate different tokens on multiple calls', () => {
      const token1 = service.generateToken();
      const token2 = service.generateToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only alphanumeric characters', () => {
      const token = service.generateToken();

      expect(token).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe('hashToken', () => {
    it('should hash a token and return hex string', () => {
      const token = 'test-token';
      const hashedToken = service.hashToken(token);

      expect(hashedToken).toBeDefined();
      expect(typeof hashedToken).toBe('string');
      expect(hashedToken.length).toBe(64); // SHA256 hash in hex is 64 characters
      expect(hashedToken).toMatch(/^[a-f0-9]+$/); // Should be lowercase hex
    });

    it('should produce same hash for same input', () => {
      const token = 'test-token';
      const hash1 = service.hashToken(token);
      const hash2 = service.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const token1 = 'test-token-1';
      const token2 = 'test-token-2';
      const hash1 = service.hashToken(token1);
      const hash2 = service.hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from request', () => {
      const mockRequest: any = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Test Browser)',
        },
        ip: '192.168.1.1',
        connection: { remoteAddress: '192.168.1.1' },
      };

      const metadata = service.extractMetadata(mockRequest as Request);

      expect(metadata).toEqual({
        userAgent: 'Mozilla/5.0 (Test Browser)',
        ipAddress: '192.168.1.1',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle missing user-agent', () => {
      const mockRequest: any = {
        headers: {},
        ip: '192.168.1.1',
        connection: { remoteAddress: '192.168.1.1' },
      };

      const metadata = service.extractMetadata(mockRequest as Request);

      expect(metadata.userAgent).toBeNull();
      expect(metadata.ipAddress).toBe('192.168.1.1');
    });

    it('should handle request without IP', () => {
      const mockRequest: any = {
        headers: {
          'user-agent': 'Test Browser',
        },
        connection: {},
      };

      const metadata = service.extractMetadata(mockRequest as Request);

      expect(metadata.userAgent).toBe('Test Browser');
      expect(metadata.ipAddress).toBeNull();
    });

    it('should set createdAt and updatedAt to current time', () => {
      const beforeCall = new Date();
      const mockRequest: any = {
        headers: {},
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
      };

      const metadata = service.extractMetadata(mockRequest as Request);
      const afterCall = new Date();

      expect(metadata.createdAt).toBeInstanceOf(Date);
      expect(metadata.updatedAt).toBeInstanceOf(Date);
      expect(metadata.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime(),
      );
      expect(metadata.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCall.getTime(),
      );
    });
  });

  describe('calculateExpiry', () => {
    it('should calculate expiry date based on config', () => {
      const durationDays = 7;
      configService.getOrThrow.mockReturnValue(durationDays);

      const beforeCall = new Date();
      const expiryDate = service.calculateExpiry();
      const afterCall = new Date();

      const expectedExpiry = new Date(
        beforeCall.getTime() + durationDays * 24 * 60 * 60 * 1000,
      );
      const maxExpectedExpiry = new Date(
        afterCall.getTime() + durationDays * 24 * 60 * 60 * 1000,
      );

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'SESSION_DURATION_DAYS',
      );
      expect(expiryDate).toBeInstanceOf(Date);
      expect(expiryDate.getTime()).toBeGreaterThanOrEqual(
        expectedExpiry.getTime(),
      );
      expect(expiryDate.getTime()).toBeLessThanOrEqual(
        maxExpectedExpiry.getTime(),
      );
    });

    it('should handle different duration values', () => {
      const testCases = [1, 30, 365];

      testCases.forEach((durationDays) => {
        configService.getOrThrow.mockReturnValue(durationDays);

        const beforeCall = Date.now();
        const expiryDate = service.calculateExpiry();
        const afterCall = Date.now();

        const expectedMinExpiry =
          beforeCall + durationDays * 24 * 60 * 60 * 1000;
        const expectedMaxExpiry =
          afterCall + durationDays * 24 * 60 * 60 * 1000;

        expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedMinExpiry);
        expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedMaxExpiry);
      });
    });

    it('should throw error if config is missing', () => {
      configService.getOrThrow.mockImplementation(() => {
        throw new Error('Configuration not found');
      });

      expect(() => service.calculateExpiry()).toThrow(
        'Configuration not found',
      );
    });
  });
});
