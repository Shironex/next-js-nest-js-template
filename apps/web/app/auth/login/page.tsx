'use client'
import { APP_ROUTES } from '@/lib/constants'
import LoginForm from '@/modules/authentication/components/login-form'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const { isUserAuth, user } = useCurrentUser()
  const router = useRouter()

  if (isUserAuth) {
    if (user.emailVerified) {
      return router.push(APP_ROUTES.HOME)
    }
    return router.push(APP_ROUTES.VERIFY_EMAIL)
  }

  return <LoginForm />
}

export default LoginPage
