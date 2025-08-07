import { UseGuards, SetMetadata } from '@nestjs/common';
import {
  RateLimit,
  RateLimitOptions,
  RATE_LIMIT_METADATA,
} from './rate-limit.decorator';
import { RateLimitGuard } from '../guards/rate-limit.guard';

// Mock NestJS decorators
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(() => jest.fn()),
  UseGuards: jest.fn(() => jest.fn()),
  applyDecorators: jest.fn((...decorators) => decorators),
}));

describe('RateLimit Decorator', () => {
  const mockSetMetadata = SetMetadata as jest.MockedFunction<
    typeof SetMetadata
  >;
  const mockUseGuards = UseGuards as jest.MockedFunction<typeof UseGuards>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RATE_LIMIT_METADATA', () => {
    it('should have correct metadata key', () => {
      expect(RATE_LIMIT_METADATA).toBe('rate_limit_metadata');
    });
  });

  describe('RateLimit decorator', () => {
    it('should apply decorators with default options', () => {
      const options: RateLimitOptions = {
        requests: 10,
        window: '5m',
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        ...options,
        requests: 10,
        window: '5m',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      });
      expect(mockUseGuards).toHaveBeenCalledWith(RateLimitGuard);
    });

    it('should use default values when options are not provided', () => {
      const options: RateLimitOptions = {
        requests: 50,
        window: '10m',
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        ...options,
        requests: 50,
        window: '10m',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      });
    });

    it('should use provided values over defaults', () => {
      const options: RateLimitOptions = {
        requests: 25,
        window: '2h',
        skipSuccessfulRequests: true,
        skipFailedRequests: true,
        keyGenerator: (req) => `custom:${req.ip}`,
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        requests: 25,
        window: '2h',
        skipSuccessfulRequests: true,
        skipFailedRequests: true,
        keyGenerator: options.keyGenerator,
      });
    });

    it('should handle minimal options with nullish coalescing', () => {
      const options: RateLimitOptions = {
        requests: 0, // Should keep 0, not use default
        window: '', // Should keep empty string, not use default
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        requests: 0,
        window: '',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      });
    });

    it('should handle undefined options with nullish coalescing defaults', () => {
      const options: RateLimitOptions = {
        requests: undefined as any,
        window: undefined as any,
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        requests: 100, // Default
        window: '1m', // Default
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
      });
    });

    it('should include custom key generator function', () => {
      const customKeyGen = jest.fn().mockReturnValue('test-key');
      const options: RateLimitOptions = {
        requests: 15,
        window: '30s',
        keyGenerator: customKeyGen,
      };

      RateLimit(options);

      expect(mockSetMetadata).toHaveBeenCalledWith(RATE_LIMIT_METADATA, {
        requests: 15,
        window: '30s',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        keyGenerator: customKeyGen,
      });
    });

    it('should preserve all provided options', () => {
      const options: RateLimitOptions = {
        requests: 5,
        window: '1h',
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
        keyGenerator: (req) => `user:${req.user?.id}`,
      };

      RateLimit(options);

      const expectedOptions = {
        ...options,
        requests: 5,
        window: '1h',
        skipSuccessfulRequests: true,
        skipFailedRequests: false,
      };

      expect(mockSetMetadata).toHaveBeenCalledWith(
        RATE_LIMIT_METADATA,
        expectedOptions,
      );
      expect(mockUseGuards).toHaveBeenCalledWith(RateLimitGuard);
    });
  });
});
