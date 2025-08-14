'use client'

import ForgotPasswordForm from '@/modules/authentication/components/forgot-password-form'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

const ForgotPasswordPage = () => {
  return (
    <AuthPageWrapper>
      <ForgotPasswordForm />
    </AuthPageWrapper>
  )
}

export default ForgotPasswordPage
