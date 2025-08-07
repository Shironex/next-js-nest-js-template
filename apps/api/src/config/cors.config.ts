import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const createCorsConfig = (frontendUrl: string): CorsOptions => {
  return {
    origin: [frontendUrl || 'http://localhost:3000'],
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
  };
};
