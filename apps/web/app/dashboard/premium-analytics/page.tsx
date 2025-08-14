'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscriptionStatus } from '@/hooks/use-subscription'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Loader2, TrendingUp, Users, DollarSign, Activity, Lock } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Progress } from '@workspace/ui/components/progress'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

function PremiumAnalyticsPageContent() {
  const router = useRouter()
  const { data: subscription, isLoading } = useSubscriptionStatus()

  useEffect(() => {
    if (!isLoading && !subscription?.isPremium) {
      // Optionally redirect to pricing or show upgrade prompt
    }
  }, [subscription, isLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!subscription?.isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Premium Analytics</h1>
          <p className="text-muted-foreground">Advanced insights and reporting for your business</p>
        </div>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            This feature is only available for premium subscribers. Upgrade your plan to access
            advanced analytics, custom reports, and data exports.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Unlock Premium Analytics</CardTitle>
            <CardDescription>Get powerful insights to grow your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp className="text-primary h-4 w-4" />
                <span>Real-time performance metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="text-primary h-4 w-4" />
                <span>User behavior analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="text-primary h-4 w-4" />
                <span>Revenue tracking and forecasting</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="text-primary h-4 w-4" />
                <span>Custom reports and data exports</span>
              </li>
            </ul>
            <Button className="w-full" onClick={() => router.push('/#pricing')}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Premium content - only shown to premium users
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Premium Analytics</h1>
        <p className="text-muted-foreground">Advanced insights and reporting for your business</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-muted-foreground text-xs">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-muted-foreground text-xs">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-muted-foreground text-xs">+4.75% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-muted-foreground text-xs">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Monthly user acquisition and retention metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">New Users</span>
              <span className="text-sm font-medium">2,350</span>
            </div>
            <Progress value={68} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Returning Users</span>
              <span className="text-sm font-medium">1,234</span>
            </div>
            <Progress value={45} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Churned Users</span>
              <span className="text-sm font-medium">89</span>
            </div>
            <Progress value={12} className="[&>div]:bg-destructive" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Revenue by product category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-2 w-2 rounded-full" />
                <span className="text-sm">Subscriptions</span>
              </div>
              <span className="text-sm font-medium">$23,450</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">One-time Purchases</span>
              </div>
              <span className="text-sm font-medium">$12,340</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Add-ons</span>
              </div>
              <span className="text-sm font-medium">$9,441.89</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Export Data</Button>
        <Button>Generate Report</Button>
      </div>
    </div>
  )
}

export default function PremiumAnalyticsPage() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <PremiumAnalyticsPageContent />
    </AuthPageWrapper>
  )
}
