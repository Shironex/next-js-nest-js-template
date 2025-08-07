import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  FRONTEND_URL: Joi.string().required(),
  API_DOMAIN: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info'),
  LOG_CONSOLE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_PATH: Joi.string().default('./logs'),
  LOG_MAX_SIZE: Joi.string().default('10m'),
  LOG_MAX_FILES: Joi.string().default('14d'),
  LOG_DATE_PATTERN: Joi.string().default('YYYY-MM-DD'),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_TLS: Joi.boolean().default(true),
  SMTP_FROM_EMAIL: Joi.string().email().required(),
  AWS_ENDPOINT: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_PORT: Joi.number().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  TURNSTILE_SECRET_KEY: Joi.string().required(),
  TURNSTILE_ENDPOINT: Joi.string().uri().required(),
  SESSION_DURATION_DAYS: Joi.number().required(),
  SESSION_REFRESH_THRESHOLD_DAYS: Joi.number().required(),
  SESSION_COOKIE_NAME: Joi.string().required(),
  SESSION_MAX_COUNT: Joi.number().required(),
});
