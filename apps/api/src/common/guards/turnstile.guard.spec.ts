import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TurnstileGuard } from './turnstile.guard';
import { TurnstileService } from '../../modules/auth/services/turnstile.service';
import {
  LoggerFactory,
  ContextBoundLogger,
} from 'src/modules/logger/logger.factory';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { REQUIRE_TURNSTILE_KEY } from '../decorators/require-turnstile.decorator';

describe('TurnstileGuard', () => {
  let guard: TurnstileGuard;
  let reflector: DeepMockProxy<Reflector>;
  let turnstileService: DeepMockProxy<TurnstileService>;
  let loggerFactory: DeepMockProxy<LoggerFactory>;
  let mockLogger: DeepMockProxy<ContextBoundLogger>;
  let mockContext: DeepMockProxy<ExecutionContext>;
  let mockRequest: any;

  beforeEach(async () => {
    mockLogger = mockDeep<ContextBoundLogger>();
    loggerFactory = mockDeep<LoggerFactory>();
    loggerFactory.createLogger.mockReturnValue(mockLogger);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnstileGuard,
        {
          provide: Reflector,
          useValue: mockDeep<Reflector>(),
        },
        {
          provide: TurnstileService,
          useValue: mockDeep<TurnstileService>(),
        },
        {
          provide: LoggerFactory,
          useValue: loggerFactory,
        },
      ],
    }).compile();

    guard = module.get<TurnstileGuard>(TurnstileGuard);
    reflector = module.get(Reflector);
    turnstileService = module.get(TurnstileService);

    // Setup mock context and request
    mockContext = mockDeep<ExecutionContext>();
    mockRequest = {
      method: 'POST',
      path: '/auth/login',
      body: {},
      headers: {},
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
    };

    mockContext.switchToHttp.mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when turnstile is not required', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        REQUIRE_TURNSTILE_KEY,
        [mockContext.getHandler(), mockContext.getClass()],
      );
      expect(turnstileService.validateToken).not.toHaveBeenCalled();
    });

    it('should return true when turnstile is not explicitly set', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(turnstileService.validateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when turnstile token is missing', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = {}; // No turnstileToken

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new BadRequestException('Missing captcha token'),
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Turnstile validation required',
        {
          endpoint: 'POST /auth/login',
          hasToken: false,
          remoteIp: '127.0.0.1',
          userAgent: undefined,
        },
      );
      expect(turnstileService.validateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when turnstile token is empty string', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = { turnstileToken: '' };

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new BadRequestException('Missing captcha token'),
      );

      expect(turnstileService.validateToken).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when turnstile validation fails', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = { turnstileToken: 'invalid-token' };
      mockRequest.headers = { 'user-agent': 'Test Browser' };

      turnstileService.validateToken.mockResolvedValue({
        isValid: false,
        errorCodes: ['invalid-input-response'],
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        new BadRequestException('Captcha verification failed'),
      );

      expect(turnstileService.validateToken).toHaveBeenCalledWith(
        'invalid-token',
        '127.0.0.1',
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Turnstile validation required',
        {
          endpoint: 'POST /auth/login',
          hasToken: true,
          remoteIp: '127.0.0.1',
          userAgent: 'Test Browser',
        },
      );
    });

    it('should return true when turnstile validation succeeds', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = { turnstileToken: 'valid-token' };
      mockRequest.headers = { 'user-agent': 'Test Browser' };

      turnstileService.validateToken.mockResolvedValue({
        isValid: true,
        hostname: 'example.com',
        action: 'login',
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(turnstileService.validateToken).toHaveBeenCalledWith(
        'valid-token',
        '127.0.0.1',
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Turnstile validation successful',
        {
          endpoint: 'POST /auth/login',
          hostname: 'example.com',
          action: 'login',
          remoteIp: '127.0.0.1',
          userAgent: 'Test Browser',
        },
      );
    });

    it('should handle request without IP address', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = { turnstileToken: 'valid-token' };
      mockRequest.ip = undefined;
      mockRequest.connection = { remoteAddress: undefined };

      turnstileService.validateToken.mockResolvedValue({
        isValid: true,
        hostname: 'example.com',
        action: 'login',
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(turnstileService.validateToken).toHaveBeenCalledWith(
        'valid-token',
        undefined,
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Turnstile validation required',
        {
          endpoint: 'POST /auth/login',
          hasToken: true,
          remoteIp: null,
          userAgent: undefined,
        },
      );
    });

    it('should handle different HTTP methods and paths', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.method = 'PUT';
      mockRequest.path = '/auth/register';
      mockRequest.body = { turnstileToken: 'valid-token' };

      turnstileService.validateToken.mockResolvedValue({
        isValid: true,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Turnstile validation required',
        expect.objectContaining({
          endpoint: 'PUT /auth/register',
        }),
      );
    });

    it('should handle validation result without hostname and action', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      mockRequest.body = { turnstileToken: 'valid-token' };

      turnstileService.validateToken.mockResolvedValue({
        isValid: true,
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Turnstile validation successful',
        {
          endpoint: 'POST /auth/login',
          hostname: undefined,
          action: undefined,
          remoteIp: '127.0.0.1',
          userAgent: undefined,
        },
      );
    });
  });
});
