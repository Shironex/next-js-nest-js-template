'use client'

import { useApiError } from '@/hooks/useApiError'
import { useMutation } from '@tanstack/react-query'
import { ResetPasswordFormData } from '../utils/validation'
import { authService } from '../services/auth-service'
import { toast } from 'sonner'

export function useResetPassword() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (data: ResetPasswordFormData & { token: string }) =>
      authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
        turnstileToken: data.turnstileToken,
      }),
    onSuccess: (response) => {
      toast.success(response._original?.message || 'Password has been reset successfully')
    },
    onError: handleError,
  })
}
