import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SessionCookieService } from './sessionCookie.service';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { Cookie } from 'src/common/interfaces/auth';

describe('SessionCookieService', () => {
  let service: SessionCookieService;
  let configService: jest.Mocked<ConfigService>;
  let mockLogger: jest.Mocked<any>;

  const mockConfig = {
    SESSION_COOKIE_NAME: 'example_session',
    API_DOMAIN: 'localhost',
    NODE_ENV: 'development',
    SESSION_DURATION_DAYS: 7,
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
        SessionCookieService,
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

    service = module.get<SessionCookieService>(SessionCookieService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should load configuration values correctly', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'SESSION_COOKIE_NAME',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith('API_DOMAIN');
      expect(configService.getOrThrow).toHaveBeenCalledWith('NODE_ENV');
    });
  });

  describe('create', () => {
    const sessionId = 'session_123';

    it('should create a session cookie with correct attributes in development', () => {
      const result = service.create(sessionId);

      expect(result).toMatchObject({
        name: mockConfig.SESSION_COOKIE_NAME,
        value: sessionId,
        attributes: {
          httpOnly: true,
          path: '/',
          domain: mockConfig.API_DOMAIN,
          secure: false, // development mode
          sameSite: 'lax',
        },
      });

      expect(result.attributes.expires).toBeInstanceOf(Date);
      expect(result.attributes.expires.getTime()).toBeGreaterThan(Date.now());

      expect(mockLogger.debug).toHaveBeenCalledWith('Creating session cookie', {
        sessionId,
        expiresAt: result.attributes.expires,
        domain: mockConfig.API_DOMAIN,
        secure: false,
      });

      expect(mockLogger.debug).toHaveBeenCalledWith('Session cookie created', {
        cookieName: mockConfig.SESSION_COOKIE_NAME,
        sessionId,
        expiresAt: result.attributes.expires,
      });
    });

    it('should create a secure cookie in production', async () => {
      // Update config to production
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return mockConfig[key];
      });

      // Recreate service with production config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SessionCookieService,
          {
            provide: ConfigService,
            useValue: configService,
          },
          {
            provide: LoggerFactory,
            useValue: {
              createLogger: jest.fn(() => mockLogger),
            },
          },
        ],
      }).compile();

      const productionService =
        module.get<SessionCookieService>(SessionCookieService);
      const result = productionService.create(sessionId);

      expect(result.attributes.secure).toBe(true);
    });

    it('should calculate expiration correctly based on session duration', () => {
      const customDuration = 14; // 14 days
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'SESSION_DURATION_DAYS') return customDuration;
        return mockConfig[key];
      });

      const startTime = Date.now();
      const result = service.create(sessionId);
      const expectedExpiration =
        startTime + customDuration * 24 * 60 * 60 * 1000;

      // Allow for small time differences in test execution
      expect(result.attributes.expires.getTime()).toBeGreaterThanOrEqual(
        expectedExpiration - 1000,
      );
      expect(result.attributes.expires.getTime()).toBeLessThanOrEqual(
        expectedExpiration + 1000,
      );
    });

    it('should handle missing config values', () => {
      configService.getOrThrow.mockImplementation((key: string) => {
        throw new Error(`Configuration key ${key} is missing`);
      });

      expect(() => service.create(sessionId)).toThrow(
        'Configuration key SESSION_DURATION_DAYS is missing',
      );
    });
  });

  describe('createBlank', () => {
    it('should create a blank cookie for logout', () => {
      const result = service.createBlank();

      expect(result).toMatchObject({
        name: mockConfig.SESSION_COOKIE_NAME,
        value: '',
        attributes: {
          expires: new Date(0),
          maxAge: 0,
          httpOnly: true,
          path: '/',
          domain: mockConfig.API_DOMAIN,
          secure: false, // development mode
          sameSite: 'lax',
        },
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Creating blank session cookie for logout',
        {
          cookieName: mockConfig.SESSION_COOKIE_NAME,
          domain: mockConfig.API_DOMAIN,
        },
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Blank session cookie created for logout',
      );
    });

    it('should create a secure blank cookie in production', async () => {
      // Update config to production
      configService.getOrThrow.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        return mockConfig[key];
      });

      // Recreate service with production config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SessionCookieService,
          {
            provide: ConfigService,
            useValue: configService,
          },
          {
            provide: LoggerFactory,
            useValue: {
              createLogger: jest.fn(() => mockLogger),
            },
          },
        ],
      }).compile();

      const productionService =
        module.get<SessionCookieService>(SessionCookieService);
      const result = productionService.createBlank();

      expect(result.attributes.secure).toBe(true);
    });
  });

  describe('getCookieName', () => {
    it('should return the configured cookie name', () => {
      const result = service.getCookieName();

      expect(result).toBe(mockConfig.SESSION_COOKIE_NAME);
    });
  });

  describe('constructor error handling', () => {
    it('should throw error when SESSION_COOKIE_NAME is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'SESSION_COOKIE_NAME')
            throw new Error('SESSION_COOKIE_NAME is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionCookieService,
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
      ).rejects.toThrow('SESSION_COOKIE_NAME is missing');
    });

    it('should throw error when API_DOMAIN is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'API_DOMAIN') throw new Error('API_DOMAIN is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionCookieService,
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
      ).rejects.toThrow('API_DOMAIN is missing');
    });

    it('should throw error when NODE_ENV is missing', async () => {
      const faultyConfigService = {
        getOrThrow: jest.fn((key: string) => {
          if (key === 'NODE_ENV') throw new Error('NODE_ENV is missing');
          return mockConfig[key];
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            SessionCookieService,
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
      ).rejects.toThrow('NODE_ENV is missing');
    });
  });
});
