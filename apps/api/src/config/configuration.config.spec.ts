import { validationSchema } from './configuration.config';

describe('Configuration Validation Schema', () => {
  describe('validationSchema', () => {
    it('should validate a complete valid configuration', () => {
      const validConfig = {
        PORT: 3001,
        NODE_ENV: 'development',
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        LOG_LEVEL: 'info',
        LOG_CONSOLE_ENABLED: true,
        LOG_FILE_PATH: './logs',
        LOG_MAX_SIZE: '10m',
        LOG_MAX_FILES: '14d',
        LOG_DATE_PATTERN: 'YYYY-MM-DD',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_TLS: true,
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error, value } = validationSchema.validate(validConfig);

      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      expect(value.PORT).toBe(3001);
      expect(value.NODE_ENV).toBe('development');
    });

    it('should apply default values when optional fields are missing', () => {
      const minimalConfig = {
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error, value } = validationSchema.validate(minimalConfig);

      expect(error).toBeUndefined();
      expect(value.PORT).toBe(3001); // default value
      expect(value.NODE_ENV).toBe('development'); // default value
      expect(value.LOG_LEVEL).toBe('info'); // default value
      expect(value.LOG_CONSOLE_ENABLED).toBe(true); // default value
      expect(value.SMTP_TLS).toBe(true); // default value
    });

    it('should reject invalid NODE_ENV values', () => {
      const invalidConfig = {
        NODE_ENV: 'invalid-env',
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error } = validationSchema.validate(invalidConfig);

      expect(error).toBeDefined();
      expect(error?.message).toContain('NODE_ENV');
    });

    it('should reject invalid LOG_LEVEL values', () => {
      const invalidConfig = {
        LOG_LEVEL: 'invalid-level',
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error } = validationSchema.validate(invalidConfig);

      expect(error).toBeDefined();
      expect(error?.message).toContain('LOG_LEVEL');
    });

    it('should reject invalid email format for SMTP_FROM_EMAIL', () => {
      const invalidConfig = {
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'invalid-email',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error } = validationSchema.validate(invalidConfig);

      expect(error).toBeDefined();
      expect(error?.message).toContain('SMTP_FROM_EMAIL');
    });

    it('should reject invalid URI format for TURNSTILE_ENDPOINT', () => {
      const invalidConfig = {
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT: 'invalid-url',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error } = validationSchema.validate(invalidConfig);

      expect(error).toBeDefined();
      expect(error?.message).toContain('TURNSTILE_ENDPOINT');
    });

    it('should require all mandatory fields', () => {
      const emptyConfig = {};

      const { error } = validationSchema.validate(emptyConfig);

      expect(error).toBeDefined();
      expect(error?.message).toContain('FRONTEND_URL');
    });

    it('should validate numeric fields correctly', () => {
      const configWithInvalidNumbers = {
        PORT: 'not-a-number',
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 'not-a-number',
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 'not-a-number',
        SESSION_REFRESH_THRESHOLD_DAYS: 'not-a-number',
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 'not-a-number',
      };

      const { error } = validationSchema.validate(configWithInvalidNumbers);

      expect(error).toBeDefined();
      // Should contain errors for multiple numeric fields
      expect(error?.message).toMatch(
        /PORT|SMTP_PORT|SESSION_DURATION_DAYS|SESSION_REFRESH_THRESHOLD_DAYS|SESSION_MAX_COUNT/,
      );
    });

    it('should validate boolean fields correctly', () => {
      const configWithValidBooleans = {
        LOG_CONSOLE_ENABLED: false,
        SMTP_TLS: false,
        FRONTEND_URL: 'http://localhost:3000',
        API_DOMAIN: 'localhost',
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_FROM_EMAIL: 'noreply@example.com',
        AWS_ENDPOINT: 'localhost',
        AWS_REGION: 'auto',
        AWS_PORT: 4569,
        AWS_ACCESS_KEY: 'S3RVER',
        AWS_SECRET_KEY: 'S3RVER',
        AWS_BUCKET_NAME: 'example',
        REDIS_URL: 'redis://localhost:6379',
        TURNSTILE_SECRET_KEY: 'secret-key-123',
        TURNSTILE_ENDPOINT:
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        SESSION_DURATION_DAYS: 7,
        SESSION_REFRESH_THRESHOLD_DAYS: 1,
        SESSION_COOKIE_NAME: 'example_session',
        SESSION_MAX_COUNT: 5,
      };

      const { error, value } = validationSchema.validate(
        configWithValidBooleans,
      );

      expect(error).toBeUndefined();
      expect(value.LOG_CONSOLE_ENABLED).toBe(false);
      expect(value.SMTP_TLS).toBe(false);
    });
  });
});
