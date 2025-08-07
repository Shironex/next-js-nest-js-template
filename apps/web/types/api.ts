// Base API Response
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  code: number
  data: T
}

// Error Response
export interface ApiErrorResponse extends ApiResponse {
  success: false
  errors?: {
    field: string
    message: string
  }[]
  timestamp: Date
  path: string
}

// Success Response
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true
}

// Import your Prisma types directly
export type Role = 'USER' | 'ADMIN'

// Full user type (what's stored in DB)
export type UserInternal = {
  id: string
  email: string
  username: string
  role: Role
  isActive: boolean
  emailVerified: boolean
  failedLoginAttempts: number
  lastFailedLoginAt: Date | null
  lockedUntil: Date | null
  createdAt: Date
  updatedAt: Date
}

// Public user type (what gets returned to frontend)
export type User = {
  id: string
  email: string
  username: string
  role: Role
  isActive: boolean
  emailVerified: boolean
}

// Full session type (what's stored in DB)
export type SessionInternal = {
  id: string
  userId: string
  userAgent: string | null
  ipAddress: string | null
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// Public session type (what gets returned to frontend)
export type Session = {
  id: string
  expiresAt: Date
  createdAt: Date
}

export type AuthMe = {
  user: User
  session: Session
}
