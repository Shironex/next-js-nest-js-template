import { ApiSuccessResponse, AuthMe } from '@/types/api'
import {
  VerifyEmailFormData,
  ResendVerificationFormData,
  RegisterDto,
  LoginResponse,
  LoginDto,
  RegisterResponse,
} from '../utils/validation'
import { api } from '@/lib/api/client'

// Helper type for API responses after global unwrapping
type UnwrappedResponse<T> = Promise<{ data: T; _original?: ApiSuccessResponse<T> }>

export const authService = {
  register: (data: RegisterDto): UnwrappedResponse<RegisterResponse> =>
    api.post('/auth/register', data),

  login: (data: LoginDto): UnwrappedResponse<LoginResponse> => api.post('/auth/login', data),

  logout: (): UnwrappedResponse<{ message: string }> => api.post('/auth/logout'),

  me: (): UnwrappedResponse<AuthMe> => api.get('/auth/me'),

  verifyEmail: (data: VerifyEmailFormData): UnwrappedResponse<{ message: string }> =>
    api.post('/auth/verify-email', data),

  resendVerification: (data: ResendVerificationFormData): UnwrappedResponse<{ message: string }> =>
    api.post('/auth/resend-verification', data),

  forgotPassword: (data: {
    email: string
    turnstileToken: string
  }): UnwrappedResponse<{ message: string }> => api.post('/auth/forgot-password', data),

  resetPassword: (data: {
    token: string
    newPassword: string
    turnstileToken: string
  }): UnwrappedResponse<{ message: string }> => api.post('/auth/reset-password', data),
}
