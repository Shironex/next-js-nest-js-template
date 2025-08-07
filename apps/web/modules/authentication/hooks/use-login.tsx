'use client'
import { useApiError } from '@/hooks/useApiError'
import { LoginDto } from '../utils/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth-service'
import { toast } from 'sonner'
import { authKeys } from '../shared'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/lib/constants'

export function useLogin() {
  const router = useRouter()
  const { handleError } = useApiError()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response) => {
      toast.success(response.data?.message)

      if (response.data.emailVerified) {
        router.push(APP_ROUTES.HOME)
      } else {
        router.push(APP_ROUTES.VERIFY_EMAIL)
      }

      // Invalidate and refetch user data after successful login
      queryClient.invalidateQueries({ queryKey: authKeys.me() })
    },
    onError: handleError,
  })
}
