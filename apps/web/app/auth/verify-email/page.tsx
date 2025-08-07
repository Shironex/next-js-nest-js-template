'use client'
import { APP_ROUTES } from '@/lib/constants'
import VerifyEmailForm from '@/modules/authentication/components/verify-email'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'

const VerifyEmailPage = () => {
  const { isUserAuth, user } = useCurrentUser()
  const router = useRouter()

  if (!isUserAuth) {
    return router.push(APP_ROUTES.LOGIN)
  }

  if (user.emailVerified) {
    return router.push(APP_ROUTES.HOME)
  }

  return <VerifyEmailForm email={user.email} />
}

export default VerifyEmailPage
