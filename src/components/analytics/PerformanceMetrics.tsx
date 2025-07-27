'use client'

import * as React from 'react'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PerformanceMetricsProps {
  data: {
    winRate: number
    averageTimeToClose: number
    dealsInProgress: number
    overdueDeals: number
    upcomingDeadlines: number
  }
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    {
      title: 'Win Rate',
      value: `${data.winRate.toFixed(1)}%`,
      icon: Target,
      progress: data.winRate,
      color: data.winRate >= 70 ? 'text-green-600' : data.winRate >= 50 ? 'text-yellow-600' : 'text-red-600',
      bgColor: data.winRate >= 70 ? 'bg-green-100' : data.winRate >= 50 ? 'bg-yellow-100' : 'bg-red-100',
    },
    {
      title: 'Avg. Time to Close',
      value: `${data.averageTimeToClose} days`,
      icon: Clock,
      description: 'From creation to completion',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Deals in Progress',
      value: data.dealsInProgress.toString(),
      icon: TrendingUp,
      description: 'Active deals in pipeline',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Attention Required',
      value: (data.overdueDeals + data.upcomingDeadlines).toString(),
      icon: AlertTriangle,
      description: `${data.overdueDeals} overdue, ${data.upcomingDeadlines} due soon`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
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
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
              {metric.progress !== undefined && (
                <Progress value={metric.progress} className="mt-2 h-2" />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
