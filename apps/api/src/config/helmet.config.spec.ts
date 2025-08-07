import { createHelmetConfig } from './helmet.config';
import helmet from 'helmet';

// Mock helmet default export
jest.mock('helmet', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('helmet-middleware'),
}));

const mockHelmet = jest.mocked(helmet);

describe('createHelmetConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create development configuration with permissive CSP', () => {
    const environment = 'development';

    createHelmetConfig(environment);

    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should create staging configuration with permissive CSP', () => {
    const environment = 'staging';

    createHelmetConfig(environment);

    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should create production configuration with strict CSP', () => {
    const environment = 'production';

    createHelmetConfig(environment);

    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should create production configuration for test environment', () => {
    const environment = 'test';

    createHelmetConfig(environment);

    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should create production configuration for unknown environment', () => {
    const environment = 'unknown';

    createHelmetConfig(environment);

    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should return helmet middleware', () => {
    const result = createHelmetConfig('development');
    expect(result).toBe('helmet-middleware');
  });

  it('should handle empty environment string', () => {
    const environment = '';

    createHelmetConfig(environment);

    // Should default to production (strict) configuration
    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });

  it('should handle null environment', () => {
    const environment = null as any;

    createHelmetConfig(environment);

    // Should default to production (strict) configuration
    expect(mockHelmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
    });
  });
});
