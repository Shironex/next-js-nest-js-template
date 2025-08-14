import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CustomLogger } from './modules/logger/logger.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { createHelmetConfig } from './config/helmet.config';
import { createCorsConfig } from './config/cors.config';
import { setupSwagger } from './config/swagger.config';
import { logStartupInfo } from './config/startup.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  // Replace the default logger with our custom logger
  const logger = app.get(CustomLogger);
  app.useLogger(logger);

  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const apiVersion = configService.get<string>('API_VERSION') || 'v1';
  const logLevel = configService.get<string>('LOG_LEVEL') || 'info';
  const environment = configService.get<string>('NODE_ENV') || 'development';
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  // =============================================================================
  // MIDDLEWARE & SECURITY
  // =============================================================================

  app.use(cookieParser());
  app.use(createHelmetConfig(environment));
  app.enableCors(createCorsConfig(frontendUrl));

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters for error handling
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  // Global interceptors for response formatting
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  // =============================================================================
  // DOCUMENTATION AND API PREFIX
  // =============================================================================
  app.setGlobalPrefix(`api/${apiVersion}`);

  const { hasScalarReference } = setupSwagger(app, environment);

  // Set context for application startup
  logger.setContext('Bootstrap');
  logger.info('Starting Example API...');

  await app.listen(port);

  logStartupInfo(logger, {
    port,
    apiVersion,
    environment,
    frontendUrl,
    logLevel,
    hasScalarReference,
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
