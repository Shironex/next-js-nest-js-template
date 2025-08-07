'use client'

import { useApiError } from '@/hooks/useApiError'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { VerifyEmailFormData } from '../utils/validation'
import { authService } from '../services/auth-service'
import { authKeys } from '../shared'
import { toast } from 'sonner'

export function useVerifyEmail() {
  const { handleError } = useApiError()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VerifyEmailFormData) => authService.verifyEmail(data),
    onSuccess: (response) => {
      toast.success(response._original?.message || 'Email verified successfully')
      // Invalidate the current user query to refresh auth state
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: handleError,
  })
}
