import { CustomLogger } from 'src/modules/logger/logger.service';

interface StartupConfig {
  port: number;
  apiVersion: string;
  environment: string;
  frontendUrl?: string;
  logLevel: string;
  hasScalarReference: boolean;
}

export const logStartupInfo = (
  logger: CustomLogger,
  config: StartupConfig,
): void => {
  const {
    port,
    apiVersion,
    environment,
    frontendUrl,
    logLevel,
    hasScalarReference,
  } = config;

  logger.log(
    `🚀 Application is running on: http://localhost:${port}`,
    'NestApplication',
  );
  logger.log(
    `📚 Swagger UI: http://localhost:${port}/api/docs`,
    'NestApplication',
  );

  if (hasScalarReference) {
    logger.log(
      `📖 Scalar API Reference: http://localhost:${port}/api/reference`,
      'NestApplication',
    );
  }

  logger.log(
    `📄 OpenAPI JSON: http://localhost:${port}/api/docs-json`,
    'NestApplication',
  );
  logger.log(`🌍 Environment: ${environment}`, 'NestApplication');
  logger.log(`📡 API Version: ${apiVersion}`, 'NestApplication');
  logger.log(`🔧 Log Level: ${logLevel}`, 'NestApplication');

  if (environment === 'development') {
    logger.log('', 'NestApplication');
    logger.log('🔗 Quick Links:', 'NestApplication');
    logger.log(
      `   Frontend: ${frontendUrl || 'http://localhost:3000'}`,
      'NestApplication',
    );
    logger.log(
      `   API Health: http://localhost:${port}/api/${apiVersion}/health`,
      'NestApplication',
    );
  }
};
