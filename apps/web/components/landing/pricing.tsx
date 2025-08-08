'use client'

import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import {
  useCreateCheckoutSession,
  useSubscriptionStatus,
  usePricingPlans,
} from '../../hooks/use-subscription'
import { useCurrentUser } from '../../modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Pricing() {
  const router = useRouter()
  const { user, isUserAuth, isLoading: isUserLoading } = useCurrentUser()
  const { data: subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscriptionStatus()
  const { data: pricingPlans, isLoading: isPricingLoading, error: pricingError } = usePricingPlans()
  const createCheckoutSession = useCreateCheckoutSession()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handlePlanSelection = async (plan: NonNullable<typeof pricingPlans>[0]) => {
    // Enterprise plan - redirect to contact form
    if (plan.id === 'enterprise') {
      router.push('#contact')
      return
    }

    // If user is not logged in, redirect to register
    if (!isUserAuth) {
      router.push('/auth/register')
      return
    }

    // If user already has an active subscription, redirect to dashboard
    if (subscriptionStatus?.isPremium) {
      router.push('/dashboard/settings')
      return
    }

    // Create Stripe checkout session
    if (plan.stripePriceId) {
      setLoadingPlan(plan.id)
      try {
        await createCheckoutSession.mutateAsync({
          priceId: plan.stripePriceId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`,
        })
      } catch (error) {
        console.error('Failed to create checkout session:', error)
      } finally {
        setLoadingPlan(null)
      }
    }
  }

  const getButtonText = (plan: NonNullable<typeof pricingPlans>[0]) => {
    if (loadingPlan === plan.id) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    if (plan.id === 'enterprise') {
      return plan.cta
    }

    if (!isUserAuth) {
      return plan.cta
    }

    if (subscriptionStatus?.isPremium) {
      return 'Manage Subscription'
    }

    return 'Subscribe Now'
  }

  // Show loading state
  if (isPricingLoading) {
    return (
      <section id="pricing" className="bg-muted/50 py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-[700px] text-xl">
              Choose the perfect plan for your team. Start free, upgrade anytime.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background rounded-2xl border p-8 shadow-sm">
                <div className="animate-pulse">
                  <div className="mb-2 h-6 rounded bg-gray-200"></div>
                  <div className="mb-4 h-8 rounded bg-gray-200"></div>
                  <div className="mb-6 h-4 rounded bg-gray-200"></div>
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="mb-2 h-4 rounded bg-gray-200"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Show error state
  if (pricingError) {
    console.log(pricingError)
    return (
      <section id="pricing" className="bg-muted/50 py-20">
        <div className="container px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-xl text-red-600">
              Failed to load pricing plans. Please try again later.
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Show pricing plans
  if (!pricingPlans) return null

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
                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePlanSelection(plan)}
                disabled={loadingPlan !== null || isUserLoading || isSubscriptionLoading}
              >
                {getButtonText(plan)}
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
