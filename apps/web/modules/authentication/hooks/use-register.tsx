'use client'
import { useApiError } from '@/hooks/useApiError'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/auth-service'
import { RegisterDto } from '../utils/validation'
import { toast } from 'sonner'

export function useRegister() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (response) => {
      toast.success(response.data.message)
    },
    onError: handleError,
  })
}
