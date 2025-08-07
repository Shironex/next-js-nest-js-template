import { createCorsConfig } from './cors.config';

describe('createCorsConfig', () => {
  it('should create CORS config with provided frontend URL', () => {
    const frontendUrl = 'https://example.com';
    const config = createCorsConfig(frontendUrl);

    expect(config).toEqual({
      origin: [frontendUrl],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
    });
  });

  it('should use default localhost URL when frontendUrl is empty', () => {
    const config = createCorsConfig('');

    expect(config).toEqual({
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
    });
  });

  it('should use default localhost URL when frontendUrl is null', () => {
    const config = createCorsConfig(null as any);

    expect(config).toEqual({
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
    });
  });

  it('should use default localhost URL when frontendUrl is undefined', () => {
    const config = createCorsConfig(undefined as any);

    expect(config).toEqual({
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
    });
  });

  it('should handle multiple URLs format', () => {
    const frontendUrl = 'https://prod.example.com';
    const config = createCorsConfig(frontendUrl);

    expect(config.origin).toEqual([frontendUrl]);
    expect(Array.isArray(config.origin)).toBe(true);
  });

  it('should always enable credentials', () => {
    const config = createCorsConfig('https://example.com');
    expect(config.credentials).toBe(true);
  });

  it('should include all necessary HTTP methods', () => {
    const config = createCorsConfig('https://example.com');
    expect(config.methods).toContain('GET');
    expect(config.methods).toContain('POST');
    expect(config.methods).toContain('PUT');
    expect(config.methods).toContain('DELETE');
    expect(config.methods).toContain('PATCH');
    expect(config.methods).toContain('OPTIONS');
  });

  it('should include all necessary headers', () => {
    const config = createCorsConfig('https://example.com');
    expect(config.allowedHeaders).toContain('Content-Type');
    expect(config.allowedHeaders).toContain('Authorization');
    expect(config.allowedHeaders).toContain('Cookie');
    expect(config.allowedHeaders).toContain('X-Requested-With');
    expect(config.allowedHeaders).toContain('Accept');
    expect(config.allowedHeaders).toContain('Origin');
  });
});
