'use client'

import * as React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface RevenueChartProps {
  data: {
    date: string
    revenue: number
    dealCount: number
  }[]
  height?: number
}

export function RevenueChart({ data, height = 300 }: RevenueChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Deals: {payload[0].payload.dealCount}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={isDark ? '#10b981' : '#22c55e'}
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor={isDark ? '#10b981' : '#22c55e'}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={isDark ? '#10b981' : '#22c55e'}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
