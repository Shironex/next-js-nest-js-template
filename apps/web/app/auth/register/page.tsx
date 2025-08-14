'use client'
import RegisterForm from '@/modules/authentication/components/register-form'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

const RegisterPage = () => {
  return (
    <AuthPageWrapper>
      <RegisterForm />
    </AuthPageWrapper>
  )
}

export default RegisterPage
