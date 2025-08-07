import { logStartupInfo } from './startup.config';
import { CustomLogger } from '../modules/logger/logger.service';

describe('logStartupInfo', () => {
  let mockLogger: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log basic startup information', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'production',
      logLevel: 'info',
      hasScalarReference: false,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith(
      '🚀 Application is running on: http://localhost:3001',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📚 Swagger UI: http://localhost:3001/api/docs',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📄 OpenAPI JSON: http://localhost:3001/api/docs-json',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '🌍 Environment: production',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📡 API Version: v1',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '🔧 Log Level: info',
      'NestApplication',
    );
  });

  it('should log Scalar API Reference when available in development', () => {
    const config = {
      port: 3000,
      apiVersion: 'v1',
      environment: 'development',
      frontendUrl: 'http://localhost:3000',
      logLevel: 'debug',
      hasScalarReference: true,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith(
      '📖 Scalar API Reference: http://localhost:3000/api/reference',
      'NestApplication',
    );
  });

  it('should not log Scalar API Reference when not available', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'production',
      logLevel: 'info',
      hasScalarReference: false,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Scalar API Reference'),
      expect.anything(),
    );
  });

  it('should log development quick links when environment is development', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'development',
      frontendUrl: 'http://localhost:3000',
      logLevel: 'debug',
      hasScalarReference: true,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith('', 'NestApplication');
    expect(mockLogger.log).toHaveBeenCalledWith(
      '🔗 Quick Links:',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '   Frontend: http://localhost:3000',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '   API Health: http://localhost:3001/api/v1/health',
      'NestApplication',
    );
  });

  it('should not log development quick links in production', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'production',
      logLevel: 'info',
      hasScalarReference: false,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).not.toHaveBeenCalledWith(
      '🔗 Quick Links:',
      'NestApplication',
    );
    expect(mockLogger.log).not.toHaveBeenCalledWith(
      expect.stringContaining('Frontend:'),
      expect.anything(),
    );
    expect(mockLogger.log).not.toHaveBeenCalledWith(
      expect.stringContaining('API Health:'),
      expect.anything(),
    );
  });

  it('should use default frontend URL when not provided in development', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'development',
      logLevel: 'debug',
      hasScalarReference: false,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith(
      '   Frontend: http://localhost:3000',
      'NestApplication',
    );
  });

  it('should handle custom port and API version', () => {
    const config = {
      port: 8080,
      apiVersion: 'v2',
      environment: 'development',
      frontendUrl: 'https://my-frontend.com',
      logLevel: 'warn',
      hasScalarReference: true,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith(
      '🚀 Application is running on: http://localhost:8080',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📚 Swagger UI: http://localhost:8080/api/docs',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📖 Scalar API Reference: http://localhost:8080/api/reference',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📄 OpenAPI JSON: http://localhost:8080/api/docs-json',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📡 API Version: v2',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '   Frontend: https://my-frontend.com',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '   API Health: http://localhost:8080/api/v2/health',
      'NestApplication',
    );
  });

  it('should handle staging environment', () => {
    const config = {
      port: 3001,
      apiVersion: 'v1',
      environment: 'staging',
      logLevel: 'info',
      hasScalarReference: true,
    };

    logStartupInfo(mockLogger, config);

    expect(mockLogger.log).toHaveBeenCalledWith(
      '🌍 Environment: staging',
      'NestApplication',
    );
    expect(mockLogger.log).toHaveBeenCalledWith(
      '📖 Scalar API Reference: http://localhost:3001/api/reference',
      'NestApplication',
    );
    // Should not log development quick links for staging
    expect(mockLogger.log).not.toHaveBeenCalledWith(
      '🔗 Quick Links:',
      'NestApplication',
    );
  });

  it('should handle all log levels', () => {
    const logLevels = ['error', 'warn', 'info', 'debug'];

    logLevels.forEach((logLevel) => {
      const config = {
        port: 3001,
        apiVersion: 'v1',
        environment: 'production',
        logLevel,
        hasScalarReference: false,
      };

      logStartupInfo(mockLogger, config);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `🔧 Log Level: ${logLevel}`,
        'NestApplication',
      );

      jest.clearAllMocks();
    });
  });
});
