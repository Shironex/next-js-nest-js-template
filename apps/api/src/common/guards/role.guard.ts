import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { Role } from 'generated/prisma';

@Injectable()
export class AdminRoleGuard extends AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check authentication
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      return false;
    }

    // Then check admin role
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
