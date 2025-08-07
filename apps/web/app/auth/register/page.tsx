'use client'
import { APP_ROUTES } from '@/lib/constants'
import RegisterForm from '@/modules/authentication/components/register-form'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'

const RegisterPage = () => {
  const { isUserAuth, user } = useCurrentUser()
  const router = useRouter()

  if (isUserAuth) {
    if (user.emailVerified) {
      return router.push(APP_ROUTES.HOME)
    }
    return router.push(APP_ROUTES.VERIFY_EMAIL)
  }

  return <RegisterForm />
}

export default RegisterPage
