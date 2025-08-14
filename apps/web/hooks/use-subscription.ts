import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'
import { getStripe } from '../lib/stripe'

interface SubscriptionStatus {
  status: string
  isPremium: boolean
}

interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

interface PortalSessionResponse {
  url: string
}

interface PricingPlan {
  id: string
  name: string
  price: string
  priceAmount: number
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
  stripePriceId: string
}

export const useSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const response = await api.get('/stripe/subscription-status')
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useCreateCheckoutSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      priceId,
      successUrl,
      cancelUrl,
    }: {
      priceId: string
      successUrl: string
      cancelUrl: string
    }) => {
      const response = await api.post<CheckoutSessionResponse>('/stripe/checkout-session', {
        priceId,
        successUrl,
        cancelUrl,
      })
      return response.data
    },
    onSuccess: async (data) => {
      const stripe = await getStripe()
      if (stripe && data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })
        if (error) {
          toast.error(error.message)
        }
      } else if (data.url) {
        window.location.href = data.url
      }
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create checkout session')
    },
  })
}

export const useCreatePortalSession = () => {
  return useMutation({
    mutationFn: async (returnUrl: string) => {
      const response = await api.post<PortalSessionResponse>('/stripe/portal-session', {
        returnUrl,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create portal session')
    },
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/stripe/cancel-subscription')
      return response.data
    },
    onSuccess: () => {
      toast.success('Subscription will be canceled at the end of the billing period')
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription')
    },
  })
}

export const usePricingPlans = () => {
  return useQuery<PricingPlan[]>({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const response = await api.get('/stripe/pricing-plans')
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useSyncProducts = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/stripe/sync-products')
      return response.data
    },
    onSuccess: () => {
      toast.success('Products synced successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to sync products')
    },
  })
}
