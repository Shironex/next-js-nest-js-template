'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth-service'
import { authKeys } from '../shared'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface UseLogout {
  autoRedirect: boolean
}

export function useLogout({ autoRedirect }: UseLogout) {
  const router = useRouter()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      toast.success(data.data.message || 'Logout successful')
      queryClient.setQueryData(authKeys.me(), null)
    },
    onSettled: () => {
      if (autoRedirect) {
        router.push('/')
      }
    },
  })
}
