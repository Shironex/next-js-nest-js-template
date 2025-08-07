'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactQueryClientProvider } from './tanstack-query-provider'
import { Toaster } from '@workspace/ui/components/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableColorScheme
    >
      <ReactQueryClientProvider>
        {children}
        <Toaster />
      </ReactQueryClientProvider>
    </NextThemesProvider>
  )
}
