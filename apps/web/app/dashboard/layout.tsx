'use client'

import type React from 'react'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthRedirect } from '@/modules/dashboard/hooks/use-auth-redirect'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isUserAuth, isLoading } = useAuthRedirect()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleMobileMenuToggle = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-2 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if user is not authenticated (redirect will happen in hook)
  if (!isUserAuth) {
    return null
  }

  return (
    <div className="bg-background flex h-screen w-full overflow-hidden">
      <DashboardSidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isMobile={isMobile}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 md:p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
