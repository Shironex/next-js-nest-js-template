'use client'

import type React from 'react'

import { useState } from 'react'
import { Menu, Bell, Search, Moon, Sun, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Badge } from '@workspace/ui/components/badge'
import { useTheme } from 'next-themes'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useLogout } from '@/modules/authentication/hooks/use-logout'
import Link from 'next/link'

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { isUserAuth, user } = useCurrentUser()
  const logout = useLogout({ autoRedirect: true })
  const [notificationCount] = useState(3) // This would come from your notification system

  const handleLogout = () => {
    logout.mutate()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const getUserInitials = (username?: string) => {
    if (!username) return 'U'
    return username
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isUserAuth) {
    return null
  }

  return (
    <header className="bg-background flex h-16 items-center gap-4 border-b px-4 md:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      {/* Spacer to push everything to the right */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            className="bg-background w-[200px] rounded-lg pl-8 lg:w-[300px]"
          />
        </div>
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.username || 'User'} />
                <AvatarFallback>{getUserInitials(user?.username)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={logout.isPending}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
