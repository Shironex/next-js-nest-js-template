import { Test, TestingModule } from '@nestjs/testing';
import { LoggerFactory, ContextBoundLogger } from './logger.factory';
import { CustomLogger } from './logger.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended/lib/Mock';
import { ConfigType } from '@nestjs/config';
import loggerConfig from '../../config/logger.config';

describe('LoggerFactory', () => {
  let factory: LoggerFactory;
  let baseLogger: DeepMockProxy<CustomLogger>;
  let config: DeepMockProxy<ConfigType<typeof loggerConfig>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerFactory,
        {
          provide: CustomLogger,
          useValue: mockDeep<CustomLogger>(),
        },
        {
          provide: loggerConfig.KEY,
          useValue: mockDeep<ConfigType<typeof loggerConfig>>(),
        },
      ],
    }).compile();

    factory = module.get<LoggerFactory>(LoggerFactory);
    baseLogger = module.get(CustomLogger);
    config = module.get(loggerConfig.KEY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLogger', () => {
    it('should create a ContextBoundLogger with specified context', () => {
      const context = 'TestService';

      const logger = factory.createLogger(context);

      expect(logger).toBeInstanceOf(ContextBoundLogger);
      expect(logger.getContext()).toBe(context);
    });

    it('should create different instances for different contexts', () => {
      const logger1 = factory.createLogger('Service1');
      const logger2 = factory.createLogger('Service2');

      expect(logger1).not.toBe(logger2);
      expect(logger1.getContext()).toBe('Service1');
      expect(logger2.getContext()).toBe('Service2');
    });

    it('should create new instances even for same context', () => {
      const logger1 = factory.createLogger('SameService');
      const logger2 = factory.createLogger('SameService');

      expect(logger1).not.toBe(logger2);
      expect(logger1.getContext()).toBe('SameService');
      expect(logger2.getContext()).toBe('SameService');
    });

    it('should handle empty context string', () => {
      const logger = factory.createLogger('');

      expect(logger).toBeInstanceOf(ContextBoundLogger);
      expect(logger.getContext()).toBe('');
    });

    it('should handle special character contexts', () => {
      const context = 'Service-With_Special.Characters@123';
      const logger = factory.createLogger(context);

      expect(logger.getContext()).toBe(context);
    });
  });

  describe('getBaseLogger', () => {
    it('should return the base logger instance', () => {
      const logger = factory.getBaseLogger();

      expect(logger).toBe(baseLogger);
    });

    it('should return the same instance on multiple calls', () => {
      const logger1 = factory.getBaseLogger();
      const logger2 = factory.getBaseLogger();

      expect(logger1).toBe(logger2);
      expect(logger1).toBe(baseLogger);
    });
  });
});

describe('ContextBoundLogger', () => {
  let contextLogger: ContextBoundLogger;
  let baseLogger: DeepMockProxy<CustomLogger>;
  const testContext = 'TestService';

  beforeEach(() => {
    baseLogger = mockDeep<CustomLogger>();
    contextLogger = new ContextBoundLogger(baseLogger, testContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with base logger and context', () => {
      expect(contextLogger.getContext()).toBe(testContext);
    });
  });

  describe('error', () => {
    it('should call base logger error with context', () => {
      const message = 'Error message';
      const error = new Error('Test error');
      const meta = { key: 'value' };

      contextLogger.error(message, error, meta);

      expect(baseLogger.error).toHaveBeenCalledWith(message, error, {
        ...meta,
        context: testContext,
      });
    });

    it('should handle call without context parameter', () => {
      const message = 'Error message';
      const error = new Error('Test error');

      contextLogger.error(message, error);

      expect(baseLogger.error).toHaveBeenCalledWith(message, error, {
        context: testContext,
      });
    });

    it('should handle call with only message', () => {
      const message = 'Error message';

      contextLogger.error(message);

      expect(baseLogger.error).toHaveBeenCalledWith(message, undefined, {
        context: testContext,
      });
    });

    it('should override context in metadata', () => {
      const message = 'Error message';
      const error = new Error('Test error');
      const meta = { context: 'OtherContext', data: 'value' };

      contextLogger.error(message, error, meta);

      expect(baseLogger.error).toHaveBeenCalledWith(message, error, {
        context: testContext, // Should override the provided context
        data: 'value',
      });
    });
  });

  describe('warn', () => {
    it('should call base logger warn with context', () => {
      const message = 'Warning message';
      const meta = { warning: true };

      contextLogger.warn(message, meta);

      expect(baseLogger.warn).toHaveBeenCalledWith(message, meta, {
        context: testContext,
      });
    });

    it('should handle call without metadata', () => {
      const message = 'Warning message';

      contextLogger.warn(message);

      expect(baseLogger.warn).toHaveBeenCalledWith(message, undefined, {
        context: testContext,
      });
    });
  });

  describe('info', () => {
    it('should call base logger info with context', () => {
      const message = 'Info message';
      const meta = { info: true };

      contextLogger.info(message, meta);

      expect(baseLogger.info).toHaveBeenCalledWith(message, meta, {
        context: testContext,
      });
    });

    it('should handle complex metadata objects', () => {
      const message = 'Info message';
      const meta = {
        nested: { data: 'value' },
        array: [1, 2, 3],
        number: 42,
      };

      contextLogger.info(message, meta);

      expect(baseLogger.info).toHaveBeenCalledWith(message, meta, {
        context: testContext,
      });
    });
  });

  describe('debug', () => {
    it('should call base logger debug with context', () => {
      const message = 'Debug message';
      const meta = { debug: true };

      contextLogger.debug(message, meta);

      expect(baseLogger.debug).toHaveBeenCalledWith(message, meta, {
        context: testContext,
      });
    });

    it('should handle null metadata', () => {
      const message = 'Debug message';

      contextLogger.debug(message, null);

      expect(baseLogger.debug).toHaveBeenCalledWith(message, null, {
        context: testContext,
      });
    });
  });

  describe('setContext', () => {
    it('should not change the bound context', () => {
      const originalContext = contextLogger.getContext();

      contextLogger.setContext('NewContext');

      expect(contextLogger.getContext()).toBe(originalContext);
      expect(contextLogger.getContext()).toBe(testContext);
    });

    it('should not affect logging context', () => {
      contextLogger.setContext('NewContext');
      contextLogger.info('Test message');

      expect(baseLogger.info).toHaveBeenCalledWith('Test message', undefined, {
        context: testContext,
      });
    });
  });

  describe('getContext', () => {
    it('should return the bound context', () => {
      expect(contextLogger.getContext()).toBe(testContext);
    });

    it('should be immutable', () => {
      const context1 = contextLogger.getContext();
      const context2 = contextLogger.getContext();

      expect(context1).toBe(context2);
      expect(context1).toBe(testContext);
    });
  });

  describe('logRequest', () => {
    it('should call base logger logRequest with context', () => {
      const method = 'GET';
      const url = '/api/test';
      const statusCode = 200;
      const responseTime = 150;
      const additionalContext = { requestId: '123' };

      contextLogger.logRequest(
        method,
        url,
        statusCode,
        responseTime,
        additionalContext,
      );

      expect(baseLogger.logRequest).toHaveBeenCalledWith(
        method,
        url,
        statusCode,
        responseTime,
        {
          ...additionalContext,
          context: testContext,
        },
      );
    });

    it('should handle call without additional context', () => {
      const method = 'POST';
      const url = '/api/create';
      const statusCode = 201;
      const responseTime = 250;

      contextLogger.logRequest(method, url, statusCode, responseTime);

      expect(baseLogger.logRequest).toHaveBeenCalledWith(
        method,
        url,
        statusCode,
        responseTime,
        {
          context: testContext,
        },
      );
    });
  });

  describe('logError', () => {
    it('should call base logger logError with bound context', () => {
      const error = new Error('Test error');
      const additionalMeta = { errorId: '456' };

      contextLogger.logError(error, 'IgnoredContext', additionalMeta);

      expect(baseLogger.logError).toHaveBeenCalledWith(
        error,
        testContext,
        additionalMeta,
      );
    });

    it('should ignore provided context parameter', () => {
      const error = new Error('Test error');

      contextLogger.logError(error, 'ShouldBeIgnored');

      expect(baseLogger.logError).toHaveBeenCalledWith(
        error,
        testContext,
        undefined,
      );
    });

    it('should handle call without context parameter', () => {
      const error = new Error('Test error');

      contextLogger.logError(error);

      expect(baseLogger.logError).toHaveBeenCalledWith(
        error,
        testContext,
        undefined,
      );
    });
  });

  describe('logDatabaseQuery', () => {
    it('should call base logger logDatabaseQuery with context', () => {
      const query = 'SELECT * FROM users';
      const duration = 50;
      const additionalContext = { table: 'users' };

      contextLogger.logDatabaseQuery(query, duration, additionalContext);

      expect(baseLogger.logDatabaseQuery).toHaveBeenCalledWith(
        query,
        duration,
        {
          ...additionalContext,
          context: testContext,
        },
      );
    });

    it('should handle call without additional context', () => {
      const query = 'INSERT INTO logs';
      const duration = 25;

      contextLogger.logDatabaseQuery(query, duration);

      expect(baseLogger.logDatabaseQuery).toHaveBeenCalledWith(
        query,
        duration,
        {
          context: testContext,
        },
      );
    });
  });

  describe('context preservation', () => {
    it('should maintain separate contexts for different instances', () => {
      const logger1 = new ContextBoundLogger(baseLogger, 'Service1');
      const logger2 = new ContextBoundLogger(baseLogger, 'Service2');

      logger1.info('Message from service 1');
      logger2.info('Message from service 2');

      expect(baseLogger.info).toHaveBeenNthCalledWith(
        1,
        'Message from service 1',
        undefined,
        {
          context: 'Service1',
        },
      );
      expect(baseLogger.info).toHaveBeenNthCalledWith(
        2,
        'Message from service 2',
        undefined,
        {
          context: 'Service2',
        },
      );
    });

    it('should handle context with special characters', () => {
      const specialContext = 'Service@123_with-Special.Chars';
      const specialLogger = new ContextBoundLogger(baseLogger, specialContext);

      specialLogger.info('Test message');

      expect(baseLogger.info).toHaveBeenCalledWith('Test message', undefined, {
        context: specialContext,
      });
    });

    it('should preserve context across different log levels', () => {
      contextLogger.debug('Debug message');
      contextLogger.info('Info message');
      contextLogger.warn('Warn message');
      contextLogger.error('Error message');

      expect(baseLogger.debug).toHaveBeenCalledWith(
        'Debug message',
        undefined,
        {
          context: testContext,
        },
      );
      expect(baseLogger.info).toHaveBeenCalledWith('Info message', undefined, {
        context: testContext,
      });
      expect(baseLogger.warn).toHaveBeenCalledWith('Warn message', undefined, {
        context: testContext,
      });
      expect(baseLogger.error).toHaveBeenCalledWith(
        'Error message',
        undefined,
        {
          context: testContext,
        },
      );
    });
  });

  describe('metadata handling', () => {
    it('should merge metadata with context correctly', () => {
      const existingMeta = {
        userId: '123',
        action: 'create',
        timestamp: Date.now(),
      };

      contextLogger.info('User action', existingMeta);

      expect(baseLogger.info).toHaveBeenCalledWith(
        'User action',
        existingMeta,
        {
          context: testContext,
        },
      );
    });

    it('should handle undefined metadata gracefully', () => {
      contextLogger.info('Message with undefined meta', undefined);

      expect(baseLogger.info).toHaveBeenCalledWith(
        'Message with undefined meta',
        undefined,
        {
          context: testContext,
        },
      );
    });

    it('should handle metadata context override', () => {
      const metaWithContext = {
        context: 'ShouldBeOverridden',
        data: 'value',
      };

      contextLogger.warn('Warning message', metaWithContext);

      expect(baseLogger.warn).toHaveBeenCalledWith(
        'Warning message',
        metaWithContext,
        {
          context: testContext, // Should override the meta context
        },
      );
    });
  });
});
