import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getServerSession } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader'
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton'
import { getAnalyticsData } from '@/lib/analytics/queries'

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Insights and analytics for your sponsorship deals',
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { 
    period?: string
    startDate?: string
    endDate?: string
    view?: string
  }
}) {
  const session = await getServerSession()
  if (!session?.user) return null

  // Parse date range from search params
  const period = searchParams.period || '30d'
  const customStartDate = searchParams.startDate
  const customEndDate = searchParams.endDate

  // Calculate date range
  const endDate = new Date()
  let startDate = new Date()
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
    case 'custom':
      if (customStartDate) startDate = new Date(customStartDate)
      if (customEndDate) endDate.setTime(new Date(customEndDate).getTime())
      break
    default:
      startDate.setDate(endDate.getDate() - 30)
  }

  // Fetch analytics data
  const analyticsData = await getAnalyticsData(session.user.id, startDate, endDate)

  return (
    <div className="flex-1 space-y-6 p-6">
      <AnalyticsHeader
        period={period}
        startDate={startDate}
        endDate={endDate}
      />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard
          data={analyticsData}
          userId={session.user.id}
          dateRange={{ startDate, endDate }}
        />
      </Suspense>
    </div>
  )
}
