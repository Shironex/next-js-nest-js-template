'use client'
import LoginForm from '@/modules/authentication/components/login-form'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

const LoginPage = () => {
  return (
    <AuthPageWrapper>
      <LoginForm />
    </AuthPageWrapper>
  )
}

export default LoginPage
