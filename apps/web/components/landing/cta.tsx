'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'

export default function Cta() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <motion.div
          className="from-primary to-primary/80 relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 text-center md:p-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative z-10">
            <motion.h2
              className="mb-4 text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Ready to Transform Your Workflow?
            </motion.h2>
            <motion.p
              className="text-primary-foreground/90 mx-auto mb-8 max-w-2xl text-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of teams already using our platform to boost productivity and
              streamline their operations.
            </motion.p>
            <motion.div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button asChild size="lg" variant="secondary" className="group font-medium">
                <Link href="/auth/register">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-medium"
              >
                <Link href="#contact">Schedule a Demo</Link>
              </Button>
            </motion.div>
            <motion.div
              className="text-primary-foreground/80 mt-8 flex items-center justify-center gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-white opacity-10" />
            <div className="absolute bottom-10 right-10 h-16 w-16 rounded-full bg-white opacity-10" />
            <div className="absolute left-1/4 top-1/2 h-12 w-12 rounded-full bg-white opacity-10" />
            <div className="absolute right-1/4 top-1/4 h-8 w-8 rounded-full bg-white opacity-10" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
