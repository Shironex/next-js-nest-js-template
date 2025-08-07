import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomLogger } from './modules/logger/logger.service';

describe('AppController', () => {
  let appController: AppController;
  let mockLogger: jest.Mocked<CustomLogger>;

  beforeEach(async () => {
    mockLogger = {
      setContext: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      verbose: jest.fn(),
      getContext: jest.fn(),
      logRequest: jest.fn(),
      logError: jest.fn(),
      logDatabaseQuery: jest.fn(),
    } as any;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing getHello request',
      );
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(mockLogger.info).toHaveBeenCalledWith('Health check requested');
    });
  });
});
