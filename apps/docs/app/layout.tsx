import './globals.css'
import { RootProvider } from 'fumadocs-ui/provider'
import type { ReactNode } from 'react'

export const metadata = {
  title: {
    default: 'Next.js + NestJS Template Documentation',
    template: '%s | Documentation',
  },
  description: 'Complete documentation for the Next.js and NestJS monorepo template',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
