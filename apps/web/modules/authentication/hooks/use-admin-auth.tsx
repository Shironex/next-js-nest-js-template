'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from './use-current-user'
import { toast } from 'sonner'

/**
 * Hook to ensure the current user is authenticated and has admin role
 * Redirects to home page if not authenticated or not admin
 */
export function useAdminAuth() {
  const { isLoading, isUserAuth, user, isError } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return

    // If there's an error or user is not authenticated, redirect to home
    if (isError || !isUserAuth) {
      toast.error('You must be logged in to access the admin panel')
      router.push('/?redirect=admin')
      return
    }

    // If user is authenticated but doesn't have admin role, redirect
    if (user && user.role !== 'ADMIN') {
      toast.error('You do not have administrator permissions')
      router.push('/')
      return
    }
  }, [isLoading, isUserAuth, user, isError, router])

  return {
    isLoading,
    isAuthenticated: isUserAuth,
    isAdmin: user?.role === 'ADMIN',
    user,
    // Return true only if user is authenticated and is admin
    hasAccess: isUserAuth && user?.role === 'ADMIN',
  }
}
