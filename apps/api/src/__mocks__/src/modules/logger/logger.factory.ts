// Mock for src/modules/logger/logger.factory
import { ILogger } from './logger.interface';

const mockLogger: jest.Mocked<ILogger> = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  getContext: jest.fn().mockReturnValue('test-context'),
};

export class ContextBoundLogger implements ILogger {
  private readonly context: string;

  constructor(
    private readonly baseLogger: any,
    context: string,
  ) {
    this.context = context;
  }

  error = jest.fn();
  warn = jest.fn();
  info = jest.fn();
  debug = jest.fn();
  setContext = jest.fn();

  getContext(): string {
    return this.context;
  }

  logRequest = jest.fn();
  logError = jest.fn();
  logDatabaseQuery = jest.fn();
}

export class LoggerFactory {
  constructor(
    private readonly config: any,
    private readonly baseLogger: any,
  ) {}

  createLogger = jest.fn().mockImplementation((context: string) => {
    return new ContextBoundLogger(mockLogger, context);
  });

  getBaseLogger = jest.fn().mockReturnValue(mockLogger);
}
