import { SafeSession, SafeUser } from './auth';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: SafeUser;
  session: SafeSession;
}
