import type React from 'react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ArrowLeft } from 'lucide-react'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-lg">Last updated: {lastUpdated}</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">{children}</div>

          {/* Contact Section */}
          <div className="bg-card mt-12 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Questions?</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this {title.toLowerCase()}, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:legal@company.com" className="text-primary hover:underline">
                  legal@company.com
                </a>
              </p>
              <p>
                <strong>Address:</strong> [Your Company Address]
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
