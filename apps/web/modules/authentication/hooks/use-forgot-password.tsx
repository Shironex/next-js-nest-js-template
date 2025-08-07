'use client'

import { useApiError } from '@/hooks/useApiError'
import { useMutation } from '@tanstack/react-query'
import { ForgotPasswordFormData } from '../utils/validation'
import { authService } from '../services/auth-service'
import { toast } from 'sonner'

export function useForgotPassword() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.forgotPassword(data),
    onSuccess: (response) => {
      toast.success(response._original?.message || 'Reset link sent to your email')
    },
    onError: handleError,
  })
}
