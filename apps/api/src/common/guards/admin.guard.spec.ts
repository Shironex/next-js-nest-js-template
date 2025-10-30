import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthRequest } from '../interfaces/auth-request.interface';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    const mockRequest: Partial<AuthRequest> = {
      user,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow access when user is admin', () => {
      const context = createMockExecutionContext({
        id: 'user-1',
        email: 'admin@example.com',
        role: 'ADMIN',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user is not admin', () => {
      const context = createMockExecutionContext({
        id: 'user-1',
        email: 'user@example.com',
        role: 'USER',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Admin access required');
    });

    it('should deny access when user is not authenticated', () => {
      const context = createMockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Authentication required',
      );
    });

    it('should deny access when user is undefined', () => {
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Authentication required',
      );
    });
  });
});
