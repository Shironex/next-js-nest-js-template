'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'

const pricingPlans = [
  {
    name: 'Starter',
    price: '$9',
    period: 'per month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      '10GB storage',
      'Basic analytics',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: 'per month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 25 team members',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'Mobile app access',
      'Custom integrations',
      'Advanced security',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For large organizations',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Custom analytics',
      '24/7 phone support',
      'Mobile app access',
      'Custom integrations',
      'Advanced security',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-muted/50 py-20">
      <div className="container px-4 md:px-6">
        <div className="mb-16 text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            className="text-muted-foreground mx-auto mt-4 max-w-[700px] text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Choose the perfect plan for your team. Start free, upgrade anytime.
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-background relative rounded-2xl border p-8 shadow-sm ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8 text-center">
                <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-muted-foreground"> /{plan.period}</span>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Link href={plan.name === 'Enterprise' ? '#contact' : '/auth/register'}>
                  {plan.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.{' '}
            <Link href="#contact" className="text-primary hover:underline">
              Have questions?
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
