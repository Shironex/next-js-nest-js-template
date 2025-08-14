'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Sheet, SheetContent } from '@workspace/ui/components/sheet'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { useLogout } from '@/modules/authentication/hooks/use-logout'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useSubscriptionStatus } from '@/hooks/use-subscription'
import { Badge } from '@workspace/ui/components/badge'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Settings,
  Users,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  Home,
  CreditCard,
  TrendingUp,
  Shield,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isActive?: (pathname: string) => boolean
  isPremium?: boolean
  isAdmin?: boolean
}

const mainNavItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/analytics'),
  },
  {
    title: 'Premium Analytics',
    href: '/dashboard/premium-analytics',
    icon: <TrendingUp className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/premium-analytics'),
    isPremium: true,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: <Users className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/team'),
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: <FileText className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/documents'),
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: <Bell className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/notifications'),
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: <Home className="h-5 w-5" />,
    isActive: (pathname) => pathname === '/',
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: <CreditCard className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/billing'),
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/settings'),
  },
  {
    title: 'Admin',
    href: '/dashboard/admin/webhook-logs',
    icon: <Shield className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/admin'),
    isAdmin: true,
  },
  {
    title: 'Help',
    href: '/dashboard/help',
    icon: <HelpCircle className="h-5 w-5" />,
    isActive: (pathname) => pathname.startsWith('/dashboard/help'),
  },
]

interface DashboardSidebarProps {
  isCollapsed?: boolean
  setIsCollapsed?: (collapsed: boolean) => void
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
  isMobile?: boolean
}

export function DashboardSidebar({
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
  isMobileOpen,
  setIsMobileOpen,
  isMobile = false,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const logout = useLogout({ autoRedirect: true })
  const { user, isUserAuth } = useCurrentUser()
  const { data: subscription } = useSubscriptionStatus()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Filter navigation items based on user role and subscription
  const filteredMainNavItems = mainNavItems.filter((item) => {
    if (item.isAdmin && user?.role !== 'ADMIN') return false
    return true
  })

  const filteredBottomNavItems = bottomNavItems.filter((item) => {
    if (item.isAdmin && user?.role !== 'ADMIN') return false
    return true
  })

  // Initialize collapsed state based on screen size and props
  useEffect(() => {
    setIsMounted(true)
    setIsCollapsed(isCollapsedProp !== undefined ? isCollapsedProp : false)
  }, [isCollapsedProp])

  // Don't render anything on the server to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (setIsCollapsedProp) {
      setIsCollapsedProp(newCollapsed)
    }
  }

  const handleLogout = () => {
    logout.mutate()
  }

  // For mobile, we use a Sheet component
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary h-8 w-8 rounded-full" />
                <span className="text-xl font-bold">ProductName</span>
              </Link>
            </div>

            {/* Main navigation */}
            <ScrollArea className="flex-1">
              <div className="py-4">
                <nav className="grid gap-1 px-2">
                  {filteredMainNavItems.map((item, index) => (
                    <MobileNavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      index={index}
                      onNavigate={() => setIsMobileOpen?.(false)}
                    />
                  ))}
                </nav>
              </div>
            </ScrollArea>

            {/* Bottom navigation */}
            <div className="border-t py-4">
              <nav className="grid gap-1 px-2">
                {filteredBottomNavItems.map((item, index) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    index={index}
                    onNavigate={() => setIsMobileOpen?.(false)}
                  />
                ))}
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-start gap-3 px-3 py-2"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  <LogOut className="text-muted-foreground h-5 w-5" />
                  <span>Log out</span>
                </Button>
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' },
  }

  const logoVariants = {
    expanded: { opacity: 1, display: 'flex' },
    collapsed: { opacity: 0, display: 'none', transition: { delay: 0 } },
  }

  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { delay: 0 } },
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="bg-background group relative flex h-screen flex-col border-r"
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-background absolute -right-4 top-4 z-50 h-8 w-8 rounded-full border shadow-md"
          onClick={toggleCollapsed}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="sr-only">{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
        </Button>

        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-full" />
            <motion.span
              className="text-xl font-bold"
              variants={logoVariants}
              initial={false}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              transition={{ duration: 0.2 }}
            >
              ProductName
            </motion.span>
          </Link>
        </div>

        {/* Main navigation */}
        <ScrollArea className="flex-1">
          <div className="py-4">
            <nav className="grid gap-1 px-2">
              {filteredMainNavItems.map((item, index) => (
                <NavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  index={index}
                />
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Bottom navigation */}
        <div className="border-t py-4">
          <nav className="grid gap-1 px-2">
            {filteredBottomNavItems.map((item, index) => (
              <NavItem
                key={item.href}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
                index={index}
              />
            ))}
            {/* Logout button with conditional rendering based on collapsed state */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-center px-0"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                  >
                    <LogOut className="text-muted-foreground h-5 w-5" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Log out
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="flex w-full items-center justify-start gap-3 px-3 py-2"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                <LogOut className="text-muted-foreground h-5 w-5" />
                <motion.span
                  variants={textVariants}
                  initial={false}
                  animate={isCollapsed ? 'collapsed' : 'expanded'}
                  transition={{ duration: 0.2 }}
                >
                  Log out
                </motion.span>
              </Button>
            )}
          </nav>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}

// Update the NavItem function to include tooltips when collapsed
function NavItem({
  item,
  pathname,
  isCollapsed,
  index,
}: {
  item: NavItem
  pathname: string
  isCollapsed: boolean
  index: number
}) {
  const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href

  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none', transition: { delay: 0 } },
  }

  // If sidebar is collapsed, wrap the link in a tooltip
  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                'flex h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isCollapsed && 'justify-center px-0',
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md',
                  isActive ? 'text-primary' : 'text-inherit',
                )}
              >
                {item.icon}
              </div>
              <motion.span
                variants={textVariants}
                initial={false}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                {item.title}
                {item.isPremium && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    PRO
                  </Badge>
                )}
              </motion.span>
              {isActive && (
                <motion.div
                  className="bg-primary absolute left-0 h-8 w-1 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </motion.div>
    )
  }

  // Regular non-collapsed view
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link
        href={item.href}
        className={cn(
          'flex h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md',
            isActive ? 'text-primary' : 'text-inherit',
          )}
        >
          {item.icon}
        </div>
        <motion.span
          variants={textVariants}
          initial={false}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          {item.title}
          {item.isPremium && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              PRO
            </Badge>
          )}
        </motion.span>
        {isActive && (
          <motion.div
            className="bg-primary absolute left-0 h-8 w-1 rounded-r-full"
            layoutId="activeIndicator"
            transition={{ duration: 0.2 }}
          />
        )}
      </Link>
    </motion.div>
  )
}

function MobileNavItem({
  item,
  pathname,
  index,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  index: number
  onNavigate: () => void
}) {
  const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link
        href={item.href}
        className={cn(
          'flex h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={onNavigate}
      >
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md',
            isActive ? 'text-primary' : 'text-inherit',
          )}
        >
          {item.icon}
        </div>
        <span className="flex items-center gap-2">
          {item.title}
          {item.isPremium && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              PRO
            </Badge>
          )}
        </span>
        {isActive && (
          <motion.div
            className="bg-primary absolute left-0 h-8 w-1 rounded-r-full"
            layoutId="mobileActiveIndicator"
            transition={{ duration: 0.2 }}
          />
        )}
      </Link>
    </motion.div>
  )
}
