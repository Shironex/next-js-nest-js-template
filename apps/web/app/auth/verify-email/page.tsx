'use client'
import VerifyEmailForm from '@/modules/authentication/components/verify-email'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'

const VerifyEmailPage = () => {
  const { user } = useCurrentUser()

  return (
    <AuthPageWrapper requiresAuth={true} allowUnverified={true}>
      {user && <VerifyEmailForm email={user.email} />}
    </AuthPageWrapper>
  )
}

export default VerifyEmailPage
