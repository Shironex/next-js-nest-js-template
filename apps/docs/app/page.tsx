import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Next.js + NestJS Template</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Complete monorepo template with authentication, API, and modern tooling
        </p>
        <Link
          href="/docs"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors"
        >
          View Documentation
        </Link>
      </div>
    </main>
  )
}
