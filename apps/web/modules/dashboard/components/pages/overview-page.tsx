'use client'

import type React from 'react'

import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
  ArrowUpRight,
  Users,
  CreditCard,
  Activity,
  BarChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Plus,
  Bell,
} from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  description: string
  trend: 'up' | 'down'
  icon: React.ReactNode
  delay?: number
}

function StatsCard({ title, value, description, trend, icon, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-muted-foreground flex items-center text-xs">
            {trend === 'up' ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {description}
            </span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

function CheckboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
    </svg>
  )
}

export function OverviewPage() {
  const { isUserAuth } = useAuthRedirect()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isUserAuth) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your account.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Users"
              value="2,543"
              description="+12.5% from last month"
              trend="up"
              icon={<Users className="text-muted-foreground h-4 w-4" />}
              delay={0}
            />
            <StatsCard
              title="Active Subscriptions"
              value="1,832"
              description="+8.2% from last month"
              trend="up"
              icon={<CreditCard className="text-muted-foreground h-4 w-4" />}
              delay={0.1}
            />
            <StatsCard
              title="Active Now"
              value="342"
              description="-2.5% from yesterday"
              trend="down"
              icon={<Activity className="text-muted-foreground h-4 w-4" />}
              delay={0.2}
            />
            <StatsCard
              title="Revenue"
              value="$48,352"
              description="+18.3% from last month"
              trend="up"
              icon={<BarChart className="text-muted-foreground h-4 w-4" />}
              delay={0.3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>User activity for the past 30 days</CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 aspect-[4/3] w-full rounded-lg p-4">
                  <div className="flex h-full items-center justify-center">
                    <LineChart className="text-muted-foreground/50 h-16 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (i % 4) }}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`/placeholder.svg?height=36&width=36`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">User {i} updated their profile</p>
                          <p className="text-muted-foreground text-xs">2 hours ago</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (i % 3) }}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`/placeholder.svg?height=36&width=36`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Team Member {i}</p>
                          <p className="text-muted-foreground text-xs">team{i}@example.com</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Recently edited documents</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (i % 3) }}
                      >
                        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md border">
                          <FileIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Document {i}.pdf</p>
                          <p className="text-muted-foreground text-xs">Updated 2 hours ago</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * (i % 3) }}
                      >
                        <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-md border">
                          <CheckboxIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Task {i}</p>
                          <p className="text-muted-foreground text-xs">Due in 2 days</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics data will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                <div className="flex h-full items-center justify-center">
                  <BarChart className="text-muted-foreground/50 h-16 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Your reports will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                <div className="flex h-full items-center justify-center">
                  <FileIcon className="text-muted-foreground/50 h-16 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Your notifications will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 aspect-[2/1] w-full rounded-lg p-4">
                <div className="flex h-full items-center justify-center">
                  <Bell className="text-muted-foreground/50 h-16 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
