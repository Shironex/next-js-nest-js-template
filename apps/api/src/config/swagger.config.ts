import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { readFileSync } from 'fs';
import { join } from 'path';

export const setupSwagger = (app: INestApplication, environment: string) => {
  // Read version from package.json
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '../../../package.json'), 'utf8'),
  );
  const version = packageJson.version;

  const config = new DocumentBuilder()
    .setTitle('Example API')
    .setDescription('Example API')
    .setVersion(version)
    .addTag('Example')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const isDevelopment = environment === 'development';
  const isStaging = environment === 'staging';

  // Scalar API (development/staging only for security)
  if (isDevelopment || isStaging) {
    app.use(
      '/api/reference',
      apiReference({
        content: swaggerDocument,
        theme: 'deepSpace',
      }),
    );
  }

  // Serve raw OpenAPI JSON
  app.getHttpAdapter().get('/api/docs-json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  return {
    hasScalarReference: isDevelopment || isStaging,
  };
};
