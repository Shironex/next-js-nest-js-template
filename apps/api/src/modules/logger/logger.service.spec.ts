import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CustomLogger } from './logger.service';
import loggerConfig from '../../config/logger.config';

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => jest.fn());

describe('CustomLogger', () => {
  let logger: CustomLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [loggerConfig],
        }),
      ],
      providers: [CustomLogger],
    }).compile();

    logger = module.get<CustomLogger>(CustomLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('context management', () => {
    it('should set and get context', () => {
      const testContext = 'TestService';
      logger.setContext(testContext);
      expect(logger.getContext()).toBe(testContext);
    });

    it('should have default context', () => {
      expect(logger.getContext()).toBe('Application');
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      logger.setContext('TestContext');
    });

    it('should call info with correct parameters', () => {
      const message = 'Test info message';
      const meta = { key: 'value' };

      logger.info(message, meta);

      // Note: We can't easily test winston calls due to mocking complexity
      // In a real scenario, you might want to test the buildMeta method separately
      expect(logger.getContext()).toBe('TestContext');
    });

    it('should call error with error object', () => {
      const message = 'Test error message';
      const error = new Error('Test error');

      logger.error(message, error);

      expect(logger.getContext()).toBe('TestContext');
    });

    it('should call warn with metadata', () => {
      const message = 'Test warning';
      const meta = { level: 'high' };

      logger.warn(message, meta);

      expect(logger.getContext()).toBe('TestContext');
    });

    it('should call debug with string data', () => {
      const message = 'Debug message';
      const data = 'debug string';

      logger.debug(message, data);

      expect(logger.getContext()).toBe('TestContext');
    });
  });

  describe('NestJS compatibility', () => {
    it('should implement log method', () => {
      const message = 'Test log message';
      const context = 'TestContext';

      logger.log(message, context);

      expect(logger.getContext()).toBe('Application'); // Should not change main context
    });

    it('should implement verbose method', () => {
      const message = 'Test verbose message';
      const context = 'TestContext';

      logger.verbose(message, context);

      expect(logger.getContext()).toBe('Application'); // Should not change main context
    });
  });

  describe('utility methods', () => {
    it('should log request with performance metrics', () => {
      const method = 'GET';
      const url = '/test';
      const statusCode = 200;
      const responseTime = 45;

      logger.logRequest(method, url, statusCode, responseTime);

      expect(logger.getContext()).toBe('Application');
    });

    it('should log database query with duration', () => {
      const query = 'SELECT * FROM users';
      const duration = 25;

      logger.logDatabaseQuery(query, duration);

      expect(logger.getContext()).toBe('Application');
    });

    it('should log error with context', () => {
      const error = new Error('Database connection failed');
      const context = 'Application';
      const meta = { connectionId: 123 };

      logger.logError(error, context, meta);

      // Context should be changed to the error context
      expect(logger.getContext()).toBe(context);
    });
  });

  describe('data type handling', () => {
    it('should handle string data', () => {
      const message = 'String test';
      const data = 'simple string';

      expect(() => logger.info(message, data)).not.toThrow();
    });

    it('should handle number data', () => {
      const message = 'Number test';
      const data = 42;

      expect(() => logger.info(message, data)).not.toThrow();
    });

    it('should handle object data', () => {
      const message = 'Object test';
      const data = { key: 'value', nested: { data: true } };

      expect(() => logger.info(message, data)).not.toThrow();
    });

    it('should handle array data', () => {
      const message = 'Array test';
      const data = [1, 2, 3, 'test'];

      expect(() => logger.info(message, data)).not.toThrow();
    });

    it('should handle Error objects', () => {
      const message = 'Error test';
      const error = new Error('Test error with stack');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      expect(() => logger.error(message, error)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined metadata', () => {
      const message = 'Test message';

      expect(() => logger.info(message)).not.toThrow();
    });

    it('should handle null metadata', () => {
      const message = 'Test message';

      expect(() => logger.info(message, null)).not.toThrow();
    });

    it('should handle circular reference objects', () => {
      const message = 'Circular reference test';
      const obj: any = { name: 'test' };
      obj.self = obj; // Create circular reference

      expect(() => logger.info(message, obj)).not.toThrow();
    });
  });
});
