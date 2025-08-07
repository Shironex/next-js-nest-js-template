import type React from 'react'
import AnimatedPanel from './animated-panel'
import { BackButton } from './back-button'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel with animated SVG */}
      <div className="bg-muted hidden w-1/2 lg:block">
        <AnimatedPanel />
      </div>

      {/* Right panel with auth forms */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="relative mx-auto w-full max-w-md px-8 py-12">
          <BackButton />
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
