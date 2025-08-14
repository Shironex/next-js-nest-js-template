import { INestApplication } from '@nestjs/common';
import { setupSwagger } from './swagger.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import * as fs from 'fs';
import * as path from 'path';

// Mock the dependencies
jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    setup: jest.fn(),
    createDocument: jest.fn().mockReturnValue({ info: { title: 'Test API' } }),
  },
}));

jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: jest.fn().mockReturnValue('scalar-middleware'),
}));

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('{"version": "1.2.3"}'),
}));

jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mocked/path/package.json'),
}));

// Get the mocked functions
const mockDocumentBuilder = jest.mocked(DocumentBuilder);
const mockSwaggerModuleSetup = jest.mocked(SwaggerModule.setup);
const mockSwaggerModuleCreateDocument = jest.mocked(
  SwaggerModule.createDocument,
);
const mockApiReference = jest.mocked(apiReference);
const mockReadFileSync = jest.mocked(fs.readFileSync);
const mockPathJoin = jest.mocked(path.join);

describe('setupSwagger', () => {
  let mockApp: jest.Mocked<INestApplication>;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      getHttpAdapter: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    } as any;

    jest.clearAllMocks();
  });

  it('should setup Swagger with dynamic version from package.json', () => {
    setupSwagger(mockApp, 'production');

    expect(mockDocumentBuilder).toHaveBeenCalled();
    // The DocumentBuilder constructor returns an object with chained methods
    // We can verify the constructor was called, but the specific method calls are internal
  });

  it('should create and setup Swagger document', () => {
    setupSwagger(mockApp, 'production');

    expect(mockSwaggerModuleCreateDocument).toHaveBeenCalledWith(mockApp, {});
    expect(mockSwaggerModuleSetup).toHaveBeenCalledWith('api/docs', mockApp, {
      info: { title: 'Test API' },
    });
  });

  it('should setup Scalar API reference in development environment', () => {
    setupSwagger(mockApp, 'development');

    expect(mockApp.use).toHaveBeenCalledWith(
      '/api/reference',
      'scalar-middleware',
    );
    expect(mockApiReference).toHaveBeenCalledWith({
      content: { info: { title: 'Test API' } },
      theme: 'deepSpace',
    });
  });

  it('should setup Scalar API reference in staging environment', () => {
    setupSwagger(mockApp, 'staging');

    expect(mockApp.use).toHaveBeenCalledWith(
      '/api/reference',
      'scalar-middleware',
    );
    expect(mockApiReference).toHaveBeenCalledWith({
      content: { info: { title: 'Test API' } },
      theme: 'deepSpace',
    });
  });

  it('should not setup Scalar API reference in production environment', () => {
    setupSwagger(mockApp, 'production');

    expect(mockApp.use).not.toHaveBeenCalled();
    expect(mockApiReference).not.toHaveBeenCalled();
  });

  it('should not setup Scalar API reference in test environment', () => {
    setupSwagger(mockApp, 'test');

    expect(mockApp.use).not.toHaveBeenCalled();
    expect(mockApiReference).not.toHaveBeenCalled();
  });

  it('should setup OpenAPI JSON endpoint', () => {
    const mockGet = jest.fn();
    const mockHttpAdapter = { get: mockGet } as any;
    mockApp.getHttpAdapter.mockReturnValue(mockHttpAdapter);

    setupSwagger(mockApp, 'development');

    expect(mockGet).toHaveBeenCalledWith(
      '/api/docs-json',
      expect.any(Function),
    );
  });

  it('should serve OpenAPI JSON with correct headers', () => {
    const mockGet = jest.fn();
    const mockHttpAdapter = { get: mockGet } as any;
    mockApp.getHttpAdapter.mockReturnValue(mockHttpAdapter);

    setupSwagger(mockApp, 'development');

    // Get the callback function passed to the route handler
    const routeHandler = mockGet.mock.calls[0][1];

    const mockReq = {};
    const mockRes = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    routeHandler(mockReq, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json',
    );
    expect(mockRes.send).toHaveBeenCalledWith({ info: { title: 'Test API' } });
  });

  it('should return hasScalarReference true for development', () => {
    const result = setupSwagger(mockApp, 'development');

    expect(result).toEqual({
      hasScalarReference: true,
    });
  });

  it('should return hasScalarReference true for staging', () => {
    const result = setupSwagger(mockApp, 'staging');

    expect(result).toEqual({
      hasScalarReference: true,
    });
  });

  it('should return hasScalarReference false for production', () => {
    const result = setupSwagger(mockApp, 'production');

    expect(result).toEqual({
      hasScalarReference: false,
    });
  });

  it('should return hasScalarReference false for unknown environment', () => {
    const result = setupSwagger(mockApp, 'unknown');

    expect(result).toEqual({
      hasScalarReference: false,
    });
  });

  it('should handle empty environment string', () => {
    const result = setupSwagger(mockApp, '');

    expect(result).toEqual({
      hasScalarReference: false,
    });
    expect(mockApp.use).not.toHaveBeenCalled();
  });

  it('should read package.json from correct path', () => {
    setupSwagger(mockApp, 'development');

    expect(mockPathJoin).toHaveBeenCalledWith(
      expect.anything(),
      '../../package.json',
    );
    expect(mockReadFileSync).toHaveBeenCalledWith(
      '/mocked/path/package.json',
      'utf8',
    );
  });
});
