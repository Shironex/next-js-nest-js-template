'use client'

import { useQuery } from '@tanstack/react-query'
import { authKeys, CurrentUserResult } from '../shared'
import { authService } from '../services/auth-service'

export function useCurrentUser(): CurrentUserResult {
  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // After global unwrapping, query.data contains the AuthMe object directly
  const authData = query.data?.data
  const isUserAuth = !!authData

  if (isUserAuth) {
    return {
      isLoading: query.isLoading,
      isError: query.isError,
      isUserAuth: true as const,
      data: authData,
      user: authData.user,
      session: authData.session,
      refetch: query.refetch,
    }
  }

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    isUserAuth: false as const,
    data: null,
    user: null,
    session: null,
    refetch: query.refetch,
  }
}
