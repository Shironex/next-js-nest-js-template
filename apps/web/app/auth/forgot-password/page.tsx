'use client'

import { APP_ROUTES } from '@/lib/constants'
import ForgotPasswordForm from '@/modules/authentication/components/forgot-password-form'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'

const ForgotPasswordPage = () => {
  const { isUserAuth, user } = useCurrentUser()
  const router = useRouter()

  if (isUserAuth) {
    if (user.emailVerified) {
      router.push(APP_ROUTES.HOME)
      return null
    }
    router.push(APP_ROUTES.VERIFY_EMAIL)
    return null
  }

  return <ForgotPasswordForm />
}

export default ForgotPasswordPage
