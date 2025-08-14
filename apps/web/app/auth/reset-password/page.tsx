'use client'

import ResetPasswordForm from '@/modules/authentication/components/reset-password-form'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

const ResetPasswordPage = () => {
  return (
    <AuthPageWrapper>
      <ResetPasswordForm />
    </AuthPageWrapper>
  )
}

export default ResetPasswordPage
