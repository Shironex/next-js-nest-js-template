import { Session, User } from 'generated/prisma';

export type SafeUser = Omit<
  User,
  | 'password'
  | 'failedLoginAttempts'
  | 'lastFailedLoginAt'
  | 'lastPasswordChangeAt'
  | 'passwordChangeCount'
  | 'lockedUntil'
  | 'createdAt'
  | 'updatedAt'
>;

export type SafeSession = Omit<
  Session,
  'ipAddress' | 'userAgent' | 'userId' | 'updatedAt'
>;

export interface SessionResponse {
  session: SafeSession;
  user: SafeUser;
}

export interface Cookie {
  name: string;
  value: string;
  attributes: {
    domain?: string;
    path?: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    expires: Date;
    maxAge?: number;
  };
}

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}
