'use client'

import { Suspense } from 'react'
import { APP_ROUTES } from '@/lib/constants'
import ResetPasswordForm from '@/modules/authentication/components/reset-password-form'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'

const ResetPasswordPageContent = () => {
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

  return <ResetPasswordForm />
}

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}

export default ResetPasswordPage
