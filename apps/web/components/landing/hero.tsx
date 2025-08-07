'use client'

import { Button } from '@workspace/ui/components/button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCurrentUser } from '../../modules/authentication/hooks/use-current-user'

export default function Hero() {
  const { isUserAuth, isLoading } = useCurrentUser()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="from-background to-background/80 absolute inset-0 -z-10 bg-gradient-to-b" />
      <div className="from-primary/20 absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent" />

      <div className="container px-4 md:px-6">
        <motion.div
          className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="flex flex-col gap-6" variants={item}>
            <div>
              <motion.div
                className="border-primary/20 bg-primary/10 text-primary mb-4 inline-flex items-center rounded-full border px-3 py-1 text-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="font-medium">New Features Available</span>
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Streamline Your Workflow with Our SaaS Solution
              </h1>
            </div>
            <p className="text-muted-foreground max-w-[600px] text-lg md:text-xl">
              Boost productivity, enhance collaboration, and scale your business with our powerful,
              intuitive platform designed for modern teams.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {!isLoading && (
                <>
                  {isUserAuth ? (
                    <Button asChild size="lg" className="font-medium">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="font-medium">
                      <Link href="/auth/register">Get Started for Free</Link>
                    </Button>
                  )}
                </>
              )}
              <Button asChild size="lg" variant="outline" className="font-medium">
                <Link href="#demo">Request Demo</Link>
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-muted ring-background inline-block h-8 w-8 rounded-full ring-2"
                  />
                ))}
              </div>
              <p>Join over 10,000+ happy customers</p>
            </div>
          </motion.div>
          <motion.div className="relative" variants={item}>
            <div className="bg-background relative mx-auto aspect-video overflow-hidden rounded-xl border shadow-xl md:w-full lg:w-[120%]">
              <Image
                src="/placeholder.svg"
                alt="Product dashboard screenshot"
                width={1280}
                height={720}
                className="object-cover"
                priority
              />
              <div className="from-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            </div>
            <motion.div
              className="bg-primary absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl p-4 shadow-lg md:h-32 md:w-32"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="bg-primary-foreground flex h-full w-full items-center justify-center rounded-xl">
                <span className="text-primary text-2xl font-bold md:text-3xl">+80%</span>
              </div>
            </motion.div>
            <motion.div
              className="bg-secondary absolute -right-6 -top-6 h-24 w-24 rounded-2xl p-4 shadow-lg md:h-32 md:w-32"
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="bg-secondary-foreground/10 flex h-full w-full items-center justify-center rounded-xl">
                <span className="text-secondary-foreground text-2xl font-bold md:text-3xl">
                  24/7
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
