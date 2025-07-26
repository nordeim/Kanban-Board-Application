'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
  BarChart3,
  FileText,
  HelpCircle,
  Moon,
  Sun,
  Menu,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

const navigation = [
  { name: 'Board', href: '/board', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Deals', href: '/deals', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [notifications, setNotifications] = React.useState(3)
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Mock data for search - in real app, this would come from API
  const mockDeals = [
    {
      id: '1',
      title: 'TechFlow Pro Software Review',
      sponsorName: 'TechFlow Solutions',
      stage: 'CONTENT_CREATION',
      dealValue: 12000,
    },
    {
      id: '2',
      title: 'GameZone Controller Integration',
      sponsorName: 'GameZone Studios',
      stage: 'NEGOTIATION',
      dealValue: 5000,
    },
  ]

  const mockSponsors = [
    {
      id: '1',
      name: 'TechFlow Solutions',
      companyName: 'TechFlow Inc.',
    },
    {
      id: '2',
      name: 'GameZone Studios',
      companyName: 'GameZone Entertainment',
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="font-bold">SponsorFlow</span>
              </Link>
            </div>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <nav className="flex flex-col gap-2 p-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-secondary text-secondary-foreground'
                          : 'hover:bg-secondary/50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2 md:mr-6">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="hidden font-bold sm:inline-block">
            SponsorFlow
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground/80',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <SearchCommand
              open={searchOpen}
              onOpenChange={setSearchOpen}
              deals={mockDeals}
              sponsors={mockSponsors}
            />
          </div>

          {/* Add new deal button */}
          <Button size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications(0)}
                >
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                <div className="flex flex-col gap-1 p-2">
                  <NotificationItem
                    title="New deal assigned"
                    description="You've been assigned to 'TechFlow Pro Review'"
                    time="5 minutes ago"
                    unread
                  />
                  <NotificationItem
                    title="Deal moved to Publishing"
                    description="'GameZone VR Headset Review' is ready to publish"
                    time="1 hour ago"
                    unread
                  />
                  <NotificationItem
                    title="Payment received"
                    description="$5,000 received for 'HealthyLife Campaign'"
                    time="2 hours ago"
                    unread
                  />
                </div>
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full justify-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          {status === 'loading' ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || ''}
                      alt={session.user.name || ''}
                    />
                    <AvatarFallback>
                      {session.user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function NotificationItem({
  title,
  description,
  time,
  unread = false,
}: {
  title: string
  description: string
  time: string
  unread?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors hover:bg-muted',
        unread && 'bg-muted/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{title}</p>
        {unread && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  )
}
