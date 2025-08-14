'use client'

import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { APP_ROUTES } from '@/lib/constants'
import AuthLoadingSkeleton from './auth-loading-skeleton'

interface AuthPageWrapperProps {
  children: React.ReactNode
  requiresAuth?: boolean
  redirectIfAuth?: string
  allowUnverified?: boolean
}

const AuthPageWrapper = ({
  children,
  requiresAuth = false,
  redirectIfAuth = APP_ROUTES.HOME,
  allowUnverified = false,
}: AuthPageWrapperProps) => {
  const { isUserAuth, user, isLoading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (requiresAuth && !isUserAuth) {
      router.push(APP_ROUTES.LOGIN)
      return
    }

    if (!requiresAuth && isUserAuth) {
      if (user.emailVerified && user.isActive) {
        router.push(redirectIfAuth)
        return
      }

      if (!user.isActive) {
        toast.error('Konto jest nieaktywne')
        return
      }

      if (!allowUnverified && !user.emailVerified) {
        router.push(APP_ROUTES.VERIFY_EMAIL)
        return
      }
    }
  }, [isLoading, isUserAuth, user, router, requiresAuth, redirectIfAuth, allowUnverified])

  if (isLoading) {
    return <AuthLoadingSkeleton />
  }

  if (requiresAuth && !isUserAuth) {
    return <AuthLoadingSkeleton />
  }

  if (!requiresAuth && isUserAuth) {
    if (user.emailVerified && user.isActive) {
      return <AuthLoadingSkeleton />
    }

    if (!user.isActive) {
      return <AuthLoadingSkeleton />
    }

    if (!allowUnverified && !user.emailVerified) {
      return <AuthLoadingSkeleton />
    }
  }

  return <>{children}</>
}

export default AuthPageWrapper
