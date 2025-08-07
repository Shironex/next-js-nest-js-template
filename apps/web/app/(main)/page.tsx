import type { Metadata } from 'next'
import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import Testimonials from '@/components/landing/testimonials'
import Pricing from '@/components/landing/pricing'
import Cta from '@/components/landing/cta'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'ProductName - Modern SaaS Solution',
  description:
    'Streamline your workflow with our powerful SaaS platform. Boost productivity and scale your business with ease.',
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
