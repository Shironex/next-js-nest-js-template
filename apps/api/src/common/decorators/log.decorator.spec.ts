import { LogRequest, LOG_METADATA, LogOptions } from './log.decorator';
import { Reflector } from '@nestjs/core';

describe('LogRequest Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('LogRequest decorator', () => {
    it('should set default options when no options provided', () => {
      class TestController {
        @LogRequest()
        testMethod() {
          return 'test';
        }
      }

      const metadata = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.testMethod,
      );

      expect(metadata).toBeDefined();
      expect(metadata.logRequest).toBe(true);
      expect(metadata.logResponse).toBe(true);
      expect(metadata.logBody).toBe(false);
      expect(metadata.logHeaders).toBe(false);
      expect(metadata.excludeFields).toEqual([
        'password',
        'token',
        'authorization',
      ]);
    });

    it('should merge custom options with defaults', () => {
      const customOptions: LogOptions = {
        logBody: true,
        logHeaders: true,
        excludeFields: ['secret', 'apiKey'],
        context: 'CustomController',
      };

      class TestController {
        @LogRequest(customOptions)
        testMethod() {
          return 'test';
        }
      }

      const metadata = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.testMethod,
      );

      expect(metadata).toBeDefined();
      expect(metadata.logRequest).toBe(true); // default
      expect(metadata.logResponse).toBe(true); // default
      expect(metadata.logBody).toBe(true); // custom
      expect(metadata.logHeaders).toBe(true); // custom
      expect(metadata.excludeFields).toEqual(['secret', 'apiKey']); // custom
      expect(metadata.context).toBe('CustomController'); // custom
    });

    it('should allow disabling request logging', () => {
      const customOptions: LogOptions = {
        logRequest: false,
      };

      class TestController {
        @LogRequest(customOptions)
        testMethod() {
          return 'test';
        }
      }

      const metadata = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.testMethod,
      );

      expect(metadata).toBeDefined();
      expect(metadata.logRequest).toBe(false);
      expect(metadata.logResponse).toBe(true); // still default
    });

    it('should allow disabling response logging', () => {
      const customOptions: LogOptions = {
        logResponse: false,
      };

      class TestController {
        @LogRequest(customOptions)
        testMethod() {
          return 'test';
        }
      }

      const metadata = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.testMethod,
      );

      expect(metadata).toBeDefined();
      expect(metadata.logRequest).toBe(true); // still default
      expect(metadata.logResponse).toBe(false);
    });

    it('should handle empty exclude fields array', () => {
      const customOptions: LogOptions = {
        excludeFields: [],
      };

      class TestController {
        @LogRequest(customOptions)
        testMethod() {
          return 'test';
        }
      }

      const metadata = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.testMethod,
      );

      expect(metadata).toBeDefined();
      expect(metadata.excludeFields).toEqual([]);
    });

    it('should work with multiple decorators on same class', () => {
      class TestController {
        @LogRequest({ context: 'Method1' })
        method1() {
          return 'method1';
        }

        @LogRequest({ context: 'Method2', logBody: true })
        method2() {
          return 'method2';
        }
      }

      const metadata1 = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.method1,
      );
      const metadata2 = reflector.get<LogOptions>(
        LOG_METADATA,
        TestController.prototype.method2,
      );

      expect(metadata1).toBeDefined();
      expect(metadata1.context).toBe('Method1');
      expect(metadata1.logBody).toBe(false);

      expect(metadata2).toBeDefined();
      expect(metadata2.context).toBe('Method2');
      expect(metadata2.logBody).toBe(true);
    });
  });

  describe('LogOptions interface', () => {
    it('should have correct default types', () => {
      const options: LogOptions = {};

      expect(typeof options.logRequest).toBe('undefined');
      expect(typeof options.logResponse).toBe('undefined');
      expect(typeof options.logBody).toBe('undefined');
      expect(typeof options.logHeaders).toBe('undefined');
      expect(options.excludeFields).toBeUndefined();
      expect(options.context).toBeUndefined();
    });

    it('should accept all valid option types', () => {
      const options: LogOptions = {
        logRequest: true,
        logResponse: false,
        logBody: true,
        logHeaders: false,
        excludeFields: ['field1', 'field2'],
        context: 'TestContext',
      };

      expect(options.logRequest).toBe(true);
      expect(options.logResponse).toBe(false);
      expect(options.logBody).toBe(true);
      expect(options.logHeaders).toBe(false);
      expect(options.excludeFields).toEqual(['field1', 'field2']);
      expect(options.context).toBe('TestContext');
    });
  });
});
