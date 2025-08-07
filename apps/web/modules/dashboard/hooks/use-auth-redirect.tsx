'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'

export function useAuthRedirect() {
  const { isUserAuth, isLoading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isUserAuth) {
      router.push('/auth/login')
    }
  }, [isUserAuth, isLoading, router])

  return { isUserAuth, isLoading }
}
