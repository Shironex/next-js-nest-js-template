import { applyDecorators } from '@nestjs/common';

/**
 * Combines multiple decorators into a single decorator
 * This helps keep controllers clean by moving Swagger documentation to separate files
 */
export function ApiDocs(
  ...decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[]
) {
  return applyDecorators(...decorators);
}
