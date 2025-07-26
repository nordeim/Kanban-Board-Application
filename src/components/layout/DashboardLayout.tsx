'use client'

import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className={cn('flex-1', className)}>{children}</main>
    </div>
  )
}
