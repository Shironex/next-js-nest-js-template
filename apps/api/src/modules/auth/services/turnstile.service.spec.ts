import { Test, TestingModule } from '@nestjs/testing';
import {
  TurnstileService,
  TurnstileVerificationResponse,
} from './turnstile.service';
import { ConfigService } from '@nestjs/config';
import {
  LoggerFactory,
  ContextBoundLogger,
} from 'src/modules/logger/logger.factory';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';

// Mock fetch globally
global.fetch = jest.fn();

describe('TurnstileService', () => {
  let service: TurnstileService;
  let configService: DeepMockProxy<ConfigService>;
  let loggerFactory: DeepMockProxy<LoggerFactory>;
  let mockLogger: DeepMockProxy<ContextBoundLogger>;

  const mockSecretKey = 'test-secret-key';
  const mockEndpoint =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  beforeEach(async () => {
    mockLogger = mockDeep<ContextBoundLogger>();
    loggerFactory = mockDeep<LoggerFactory>();
    loggerFactory.createLogger.mockReturnValue(mockLogger);

    // Create config service mock with implementation BEFORE module compilation
    const configServiceMock = mockDeep<ConfigService>();
    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      if (key === 'TURNSTILE_SECRET_KEY') return mockSecretKey;
      if (key === 'TURNSTILE_ENDPOINT') return mockEndpoint;
      throw new Error(`Unknown config key: ${key}`);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnstileService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: LoggerFactory,
          useValue: loggerFactory,
        },
      ],
    }).compile();

    service = module.get<TurnstileService>(TurnstileService);
    configService = module.get(ConfigService);

    // Reset fetch mock
    (fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return invalid result for empty token', async () => {
      const result = await service.validateToken('');

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['Missing token'],
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Empty or missing Turnstile token provided',
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return invalid result for null token', async () => {
      const result = await service.validateToken(null as any);

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['Missing token'],
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Empty or missing Turnstile token provided',
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return invalid result for whitespace-only token', async () => {
      const result = await service.validateToken('   ');

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['Missing token'],
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Empty or missing Turnstile token provided',
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should successfully validate a valid token', async () => {
      const mockResponse: TurnstileVerificationResponse = {
        success: true,
        challenge_ts: '2023-01-01T00:00:00.000Z',
        hostname: 'example.com',
        action: 'login',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.validateToken('valid-token', '127.0.0.1');

      expect(result).toEqual({
        isValid: true,
        hostname: 'example.com',
        action: 'login',
      });

      expect(fetch).toHaveBeenCalledWith(mockEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: expect.any(URLSearchParams),
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Turnstile token validation successful',
        expect.objectContaining({
          hostname: 'example.com',
          action: 'login',
          remoteIp: '127.0.0.1',
        }),
      );
    });

    it('should handle invalid token response from Turnstile API', async () => {
      const mockResponse: TurnstileVerificationResponse = {
        success: false,
        'error-codes': ['invalid-input-response'],
        hostname: 'example.com',
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.validateToken('invalid-token');

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['invalid-input-response'],
        hostname: 'example.com',
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Turnstile validation failed',
        expect.objectContaining({
          errorCodes: ['invalid-input-response'],
          hostname: 'example.com',
        }),
      );
    });

    it('should handle HTTP error from Turnstile API', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await service.validateToken('test-token');

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['An error occurred during captcha response verification'],
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Turnstile API request failed',
        undefined,
        expect.objectContaining({
          status: 500,
          statusText: 'Internal Server Error',
          url: mockEndpoint,
        }),
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValue(networkError);

      const result = await service.validateToken('test-token');

      expect(result).toEqual({
        isValid: false,
        errorCodes: ['An error occurred during token verification'],
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Turnstile validation error',
        expect.objectContaining({
          error: networkError,
        }),
      );
    });

    it('should include remoteIp in request when provided', async () => {
      const mockResponse: TurnstileVerificationResponse = {
        success: true,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await service.validateToken('test-token', '192.168.1.1');

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;

      expect(body.get('secret')).toBe(mockSecretKey);
      expect(body.get('response')).toBe('test-token');
      expect(body.get('remoteip')).toBe('192.168.1.1');
    });

    it('should not include remoteIp in request when not provided', async () => {
      const mockResponse: TurnstileVerificationResponse = {
        success: true,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await service.validateToken('test-token');

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;

      expect(body.get('secret')).toBe(mockSecretKey);
      expect(body.get('response')).toBe('test-token');
      expect(body.get('remoteip')).toBeNull();
    });

    it('should log debug information at start of validation', async () => {
      const mockResponse: TurnstileVerificationResponse = {
        success: true,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await service.validateToken('test-token', '127.0.0.1');

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Starting Turnstile token validation',
        {
          tokenLength: 10,
          remoteIp: '127.0.0.1',
          endpoint: mockEndpoint,
        },
      );
    });
  });
});
