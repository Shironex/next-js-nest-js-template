'use client'

import { motion } from 'framer-motion'
import { useAuthRedirect } from '@/modules/dashboard/hooks/use-auth-redirect'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointer,
  Calendar,
  Download,
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  description: string
}

function MetricCard({ title, value, change, trend, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-muted-foreground flex items-center text-xs">
          {trend === 'up' ? (
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
          )}
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>{change}</span>
          <span className="ml-1">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsPage() {
  const { isUserAuth } = useAuthRedirect()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (!isUserAuth) {
    return null
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your application performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Visitors"
          value="24,567"
          change="+12.5%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
          description="Compared to last month"
        />
        <MetricCard
          title="Page Views"
          value="89,234"
          change="+8.2%"
          trend="up"
          icon={<Eye className="h-4 w-4" />}
          description="Compared to last month"
        />
        <MetricCard
          title="Average Session"
          value="4m 32s"
          change="-2.1%"
          trend="down"
          icon={<Clock className="h-4 w-4" />}
          description="Compared to last month"
        />
        <MetricCard
          title="Bounce Rate"
          value="34.2%"
          change="-5.4%"
          trend="up"
          icon={<MousePointer className="h-4 w-4" />}
          description="Compared to last month"
        />
      </motion.div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                <CardDescription>Daily visitor count over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 aspect-[4/3] w-full rounded-lg p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                      <p className="text-muted-foreground">Chart visualization would go here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: '/', views: '12,543', change: '+12%' },
                    { page: '/dashboard', views: '8,721', change: '+8%' },
                    { page: '/auth/login', views: '6,234', change: '+15%' },
                    { page: '/pricing', views: '4,567', change: '+5%' },
                    { page: '/features', views: '3,890', change: '-2%' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.page}</p>
                        <p className="text-muted-foreground text-xs">{item.views} views</p>
                      </div>
                      <div
                        className={`text-xs ${
                          item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Visitor device types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Desktop</span>
                    <span className="text-sm font-medium">64.2%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '64.2%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile</span>
                    <span className="text-sm font-medium">28.7%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: '28.7%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tablet</span>
                    <span className="text-sm font-medium">7.1%</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: '7.1%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Data</CardTitle>
                <CardDescription>Top visitor locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { country: 'United States', percentage: '34.5%' },
                    { country: 'United Kingdom', percentage: '18.2%' },
                    { country: 'Germany', percentage: '12.8%' },
                    { country: 'France', percentage: '9.4%' },
                    { country: 'Canada', percentage: '6.7%' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.country}</span>
                      <span className="text-sm font-medium">{item.percentage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity</CardTitle>
                <CardDescription>Current active users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">147</div>
                  <p className="text-muted-foreground mb-4 text-sm">users online now</p>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span>Page views (last hour)</span>
                      <span className="font-medium">892</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New visitors</span>
                      <span className="font-medium">64</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Returning visitors</span>
                      <span className="font-medium">83</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                      <p className="text-muted-foreground">
                        Traffic source breakdown chart would go here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>User Behavior</CardTitle>
                <CardDescription>How users interact with your application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <MousePointer className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                      <p className="text-muted-foreground">
                        User behavior flow chart would go here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Tracking</CardTitle>
                <CardDescription>Track your goals and conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Calendar className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                      <p className="text-muted-foreground">
                        Conversion funnel visualization would go here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
