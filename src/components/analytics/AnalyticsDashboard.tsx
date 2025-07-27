'use client'

import * as React from 'react'
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AnalyticsData } from '@/lib/analytics/queries'
import { formatCurrency, cn } from '@/lib/utils'

// Import chart components
import { RevenueChart } from './charts/RevenueChart'
import { DealFlowChart } from './charts/DealFlowChart'
import { StageDistributionChart } from './charts/StageDistributionChart'
import { DealTypeChart } from './charts/DealTypeChart'
import { SponsorLeaderboard } from './SponsorLeaderboard'
import { StageMetricsTable } from './StageMetricsTable'
import { PerformanceMetrics } from './PerformanceMetrics'

interface AnalyticsDashboardProps {
  data: AnalyticsData
  userId: string
  dateRange: {
    startDate: Date
    endDate: Date
  }
}

export function AnalyticsDashboard({ data, userId, dateRange }: AnalyticsDashboardProps) {
  // Calculate period-over-period changes
  const previousPeriodData = usePreviousPeriodData(userId, dateRange)
  
  const metrics = [
    {
      title: 'Total Deal Value',
      value: formatCurrency(data.overview.totalValue),
      change: calculateChange(data.overview.totalValue, previousPeriodData?.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Deals',
      value: data.overview.activeDeals.toString(),
      change: calculateChange(data.overview.activeDeals, previousPeriodData?.activeDeals),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Conversion Rate',
      value: `${data.overview.conversionRate.toFixed(1)}%`,
      change: calculateChange(data.overview.conversionRate, previousPeriodData?.conversionRate),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg. Cycle Time',
      value: `${data.overview.averageCycleTime} days`,
      change: calculateChange(data.overview.averageCycleTime, previousPeriodData?.averageCycleTime, true),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.change >= 0
          const isInverse = metric.title === 'Avg. Cycle Time' // Lower is better
          const trend = isInverse ? !isPositive : isPositive
          
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className={cn('rounded-full p-2', metric.bgColor)}>
                  <Icon className={cn('h-4 w-4', metric.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {previousPeriodData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {trend ? (
                      <ArrowUp className="inline h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDown className="inline h-3 w-3 text-red-600" />
                    )}
                    <span className={cn('ml-1', trend ? 'text-green-600' : 'text-red-600')}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                    <span className="ml-1 text-muted-foreground">from last period</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Performance Alerts */}
      {(data.performanceMetrics.overdueDeals > 0 || 
        data.performanceMetrics.upcomingDeadlines > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.performanceMetrics.overdueDeals > 0 && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base">Overdue Deals</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {data.performanceMetrics.overdueDeals}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>
          )}
          
          {data.performanceMetrics.upcomingDeadlines > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {data.performanceMetrics.upcomingDeadlines}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Due in the next 7 days
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <StageDistributionChart data={data.dealsByStage} />
            <DealTypeChart data={data.dealsByType} />
          </div>
          
          <DealFlowChart data={data.dealFlow} />
          
          <SponsorLeaderboard sponsors={data.topSponsors} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Total revenue: {formatCurrency(data.overview.totalRevenue)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data.revenueOverTime} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Deal Type</CardTitle>
              </CardHeader>
              <CardContent>
                <DealTypeChart 
                  data={data.dealsByType} 
                  dataKey="value" 
                  showLegend 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.dealsByPriority.map((item) => {
                  const percentage = data.overview.activeDeals > 0
                    ? (item.count / data.overview.activeDeals) * 100
                    : 0
                  
                  return (
                    <div key={item.priority} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.priority}</span>
                        <span className="text-muted-foreground">
                          {item.count} deals • {formatCurrency(item.value)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <StageMetricsTable data={data.stageMetrics} />
          
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
              <CardDescription>
                Deal distribution across stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dealsByStage.map((stage) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">
                        {stage.count} deals • {formatCurrency(stage.value)}
                      </span>
                    </div>
                    <Progress value={stage.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetrics data={data.performanceMetrics} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Win Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {data.performanceMetrics.winRate.toFixed(1)}%
                    </span>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <Progress value={data.performanceMetrics.winRate} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Based on {data.overview.completedDeals} completed deals
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Deal Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(data.overview.averageDealValue)}
                    </span>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Highest</p>
                      <p className="font-medium">
                        {formatCurrency(Math.max(...data.dealsByType.map(d => d.value / d.count)))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lowest</p>
                      <p className="font-medium">
                        {formatCurrency(Math.min(...data.dealsByType.map(d => d.value / d.count)))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function calculateChange(current: number, previous?: number, inverse = false): number {
  if (!previous || previous === 0) return 0
  const change = ((current - previous) / previous) * 100
  return inverse ? -change : change
}

function usePreviousPeriodData(userId: string, dateRange: { startDate: Date; endDate: Date }) {
  // This would fetch data for the previous period
  // For now, returning null to indicate no comparison data
  return null
}
