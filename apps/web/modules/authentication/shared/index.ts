import { AuthMe, Session, User } from '@/types/api'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export type AuthenticatedUser = {
  isLoading: boolean
  isError: boolean
  isUserAuth: true
  data: AuthMe
  user: User
  session: Session
  refetch: () => void
}

export type UnauthenticatedUser = {
  isLoading: boolean
  isError: boolean
  isUserAuth: false
  data: null
  user: null
  session: null
  refetch: () => void
}

export type CurrentUserResult = AuthenticatedUser | UnauthenticatedUser
