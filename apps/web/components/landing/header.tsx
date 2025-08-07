'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Sheet, SheetContent, SheetTrigger } from '@workspace/ui/components/sheet'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 10)
  })

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-background/80 shadow-sm backdrop-blur-md' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="bg-primary h-8 w-8 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
          <span className="text-xl font-bold">ProductName</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Testimonials
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-primary text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Button asChild variant="ghost">
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Sign up</Link>
          </Button>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="bg-primary h-8 w-8 rounded-full" />
                  <span className="text-xl font-bold">ProductName</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-2 px-2">
                  <Link
                    href="#features"
                    className="hover:bg-muted flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#testimonials"
                    className="hover:bg-muted flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <Link
                    href="#pricing"
                    className="hover:bg-muted flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/dashboard"
                    className="hover:bg-muted flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                </nav>
              </div>
              <div className="border-t p-4">
                <div className="grid gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
