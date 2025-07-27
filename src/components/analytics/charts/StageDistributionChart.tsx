'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface StageDistributionChartProps {
  data: {
    stage: string
    count: number
    value: number
    percentage: number
  }[]
  height?: number
}

const STAGE_COLORS = {
  'NEW LEADS': '#94a3b8',
  'INITIAL CONTACT': '#3b82f6',
  'NEGOTIATION': '#eab308',
  'CONTRACT REVIEW': '#f97316',
  'CONTENT CREATION': '#a855f7',
  'REVIEW APPROVAL': '#ec4899',
  'PUBLISHING': '#22c55e',
  'PAYMENT PENDING': '#ef4444',
  'COMPLETED': '#10b981',
}

export function StageDistributionChart({ data, height = 300 }: StageDistributionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Deals: {payload[0].value}
          </p>
          <p className="text-sm text-muted-foreground">
            Value: {formatCurrency(payload[0].payload.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {payload[0].payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Pipeline</CardTitle>
        <CardDescription>Distribution of deals across stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="stage"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STAGE_COLORS[entry.stage.toUpperCase() as keyof typeof STAGE_COLORS] || '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
