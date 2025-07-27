'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface AnalyticsHeaderProps {
  period: string
  startDate: Date
  endDate: Date
}

export function AnalyticsHeader({ period, startDate, endDate }: AnalyticsHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExporting, setIsExporting] = React.useState(false)

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', value)
    if (value !== 'custom') {
      params.delete('startDate')
      params.delete('endDate')
    }
    router.push(`/analytics?${params.toString()}`)
  }

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', 'custom')
    params.set(type === 'start' ? 'startDate' : 'endDate', format(date, 'yyyy-MM-dd'))
    router.push(`/analytics?${params.toString()}`)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and performance metrics for your sponsorship deals
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
        
        {period === 'custom' && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  {startDate ? format(startDate, 'PPP') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateChange('start', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  {endDate ? format(endDate, 'PPP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateChange('end', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </div>
    </div>
  )
}
