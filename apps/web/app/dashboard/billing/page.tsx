'use client'

import {
  useSubscriptionStatus,
  useCreatePortalSession,
  useCancelSubscription,
} from '@/hooks/use-subscription'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/stripe'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscriptionStatus()
  const createPortalSession = useCreatePortalSession()
  const cancelSubscription = useCancelSubscription()

  const handleManageSubscription = async () => {
    await createPortalSession.mutateAsync(window.location.href)
  }

  const handleCancelSubscription = async () => {
    if (
      confirm(
        'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.',
      )
    ) {
      await cancelSubscription.mutateAsync()
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>
      case 'TRIALING':
        return <Badge className="bg-blue-500">Trial</Badge>
      case 'PAST_DUE':
        return <Badge className="bg-yellow-500">Past Due</Badge>
      case 'CANCELED':
        return <Badge className="bg-gray-500">Canceled</Badge>
      case 'FREE':
        return <Badge variant="outline">Free</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription status and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            {getStatusBadge(subscription?.status || 'FREE')}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan Type</span>
            <span className="text-sm">{subscription?.isPremium ? 'Premium' : 'Free'}</span>
          </div>

          {subscription?.isPremium && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Billing Period</span>
                <span className="text-sm">Monthly</span>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Subscription Active</AlertTitle>
                <AlertDescription>
                  You have access to all premium features. Thank you for your support!
                </AlertDescription>
              </Alert>
            </>
          )}

          {!subscription?.isPremium && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Free Plan</AlertTitle>
              <AlertDescription>
                Upgrade to Premium to unlock advanced features and priority support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {subscription?.isPremium ? (
            <>
              <Button onClick={handleManageSubscription} disabled={createPortalSession.isPending}>
                {createPortalSession.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Manage Subscription
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Cancel Subscription
              </Button>
            </>
          ) : (
            <Button onClick={() => (window.location.href = '/#pricing')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
        </CardFooter>
      </Card>

      {subscription?.isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods and billing address</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              To update your payment method or billing details, click the "Manage Subscription"
              button above. You'll be redirected to our secure billing portal.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {subscription?.isPremium
              ? 'Access your billing history through the billing portal by clicking "Manage Subscription".'
              : 'No billing history available on the free plan.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
