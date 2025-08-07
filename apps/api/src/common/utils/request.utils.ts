import { Request } from 'express';

export function getClientIp(request: Request): string | null {
  return (
    (request.headers?.['x-forwarded-for'] as string) ||
    (request.headers?.['x-real-ip'] as string) ||
    request.connection?.remoteAddress ||
    request.ip ||
    null
  );
}
