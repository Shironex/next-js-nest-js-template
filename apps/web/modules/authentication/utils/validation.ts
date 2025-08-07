import { z } from 'zod'

export const signinSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().min(1, 'Please complete the verification'),
})

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, hyphens, and underscores',
      ),
    email: z.email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    turnstileToken: z.string().min(1, 'Please complete the verification'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
  turnstileToken: z.string().min(1, 'Please complete the verification'),
})

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(8, 'Verification code must be exactly 8 digits')
    .regex(/^[0-9]{8}$/, 'Verification code must contain only numbers'),
  turnstileToken: z.string().min(1, 'Please complete the verification'),
})

export const resendVerificationSchema = z.object({
  turnstileToken: z.string().min(1, 'Please complete the verification'),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    turnstileToken: z.string().min(1, 'Please complete the verification'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SigninFormData = z.infer<typeof signinSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type LoginDto = {
  email: string
  password: string
  turnstileToken: string
}
export type RegisterResponse = {
  message: string
  nextSteps: string
}
export type LoginResponse = {
  message: string
  emailVerified: boolean
}
export type RegisterDto = LoginDto & {
  username: string
}
