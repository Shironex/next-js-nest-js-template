import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export const formatPrice = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

export const getSubscriptionTier = (status: string): 'free' | 'premium' | 'pro' => {
  switch (status) {
    case 'ACTIVE':
    case 'TRIALING':
      return 'premium'
    case 'FREE':
    default:
      return 'free'
  }
}

export const isSubscriptionActive = (status: string): boolean => {
  return status === 'ACTIVE' || status === 'TRIALING'
}
