'use client'

import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { APP_ROUTES } from '@/lib/constants'
import AuthLoadingSkeleton from './auth-loading-skeleton'
import DashboardLoadingSkeleton from '@/components/dashboard/dashboard-loading-skeleton'

interface AuthPageWrapperProps {
  children: React.ReactNode
  requiresAuth?: boolean
  redirectIfAuth?: string
  allowUnverified?: boolean
  loadingType?: 'auth' | 'dashboard'
}

const AuthPageWrapper = ({
  children,
  requiresAuth = false,
  redirectIfAuth = APP_ROUTES.HOME,
  allowUnverified = false,
  loadingType = 'auth',
}: AuthPageWrapperProps) => {
  const { isUserAuth, user, isLoading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (requiresAuth && !isUserAuth) {
      router.push(APP_ROUTES.LOGIN)
      return
    }

    if (requiresAuth && isUserAuth) {
      if (!user.isActive) {
        toast.error('Konto jest nieaktywne')
        return
      }

      if (!allowUnverified && !user.emailVerified) {
        router.push(APP_ROUTES.VERIFY_EMAIL)
        return
      }
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

  const LoadingComponent =
    loadingType === 'dashboard' ? DashboardLoadingSkeleton : AuthLoadingSkeleton

  if (isLoading) {
    return <LoadingComponent />
  }

  if (requiresAuth && !isUserAuth) {
    return <LoadingComponent />
  }

  if (requiresAuth && isUserAuth) {
    if (!user.isActive) {
      return <LoadingComponent />
    }

    if (!allowUnverified && !user.emailVerified) {
      return <LoadingComponent />
    }
  }

  if (!requiresAuth && isUserAuth) {
    if (user.emailVerified && user.isActive) {
      return <LoadingComponent />
    }

    if (!user.isActive) {
      return <LoadingComponent />
    }

    if (!allowUnverified && !user.emailVerified) {
      return <LoadingComponent />
    }
  }

  return <>{children}</>
}

export default AuthPageWrapper
