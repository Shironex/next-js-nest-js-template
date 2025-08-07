'use client'

import { useApiError } from '@/hooks/useApiError'
import { useMutation } from '@tanstack/react-query'
import { ResendVerificationFormData } from '../utils/validation'
import { authService } from '../services/auth-service'
import { toast } from 'sonner'

export function useResendVerification() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (data: ResendVerificationFormData) => authService.resendVerification(data),
    onSuccess: (response) => {
      toast.success(response._original?.message || 'Verification code sent')
    },
    onError: handleError,
  })
}
