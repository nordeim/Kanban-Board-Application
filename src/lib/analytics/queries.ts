import { prisma } from '@/lib/db/prisma'
import { 
  startOfDay, 
  endOfDay, 
  eachDayOfInterval, 
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from 'date-fns'

export interface AnalyticsData {
  overview: {
    totalDeals: number
    activeDeals: number
    completedDeals: number
    totalValue: number
    averageDealValue: number
    totalRevenue: number
    conversionRate: number
    averageCycleTime: number
  }
  dealsByStage: {
    stage: string
    count: number
    value: number
    percentage: number
  }[]
  dealsByType: {
    type: string
    count: number
    value: number
  }[]
  dealsByPriority: {
    priority: string
    count: number
    value: number
  }[]
  topSponsors: {
    id: string
    name: string
    companyName: string | null
    dealCount: number
    totalValue: number
    averageValue: number
  }[]
  revenueOverTime: {
    date: string
    revenue: number
    dealCount: number
  }[]
  dealFlow: {
    date: string
    created: number
    completed: number
    cancelled: number
  }[]
  performanceMetrics: {
    winRate: number
    averageTimeToClose: number
    dealsInProgress: number
    overdueDeals: number
    upcomingDeadlines: number
  }
  stageMetrics: {
    stage: string
    averageTime: number
    deals: number
    conversion: number
  }[]
}

export async function getAnalyticsData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsData> {
  // Set date boundaries
  const start = startOfDay(startDate)
  const end = endOfDay(endDate)

  // Fetch all deals for the user
  const allDeals = await prisma.deal.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      sponsor: true,
      stageHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  // Filter deals by date range
  const deals = allDeals.filter(
    (deal) => deal.createdAt >= start && deal.createdAt <= end
  )

  // Calculate overview metrics
  const activeDeals = allDeals.filter(
    (deal) => !deal.isArchived && deal.stage !== 'COMPLETED'
  )
  const completedDeals = deals.filter((deal) => deal.stage === 'COMPLETED')
  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.dealValue), 0)
  const totalRevenue = completedDeals.reduce(
    (sum, deal) => sum + Number(deal.amountPaid), 0
  )

  const overview = {
    totalDeals: deals.length,
    activeDeals: activeDeals.length,
    completedDeals: completedDeals.length,
    totalValue,
    averageDealValue: deals.length > 0 ? totalValue / deals.length : 0,
    totalRevenue,
    conversionRate:
      deals.length > 0 ? (completedDeals.length / deals.length) * 100 : 0,
    averageCycleTime: calculateAverageCycleTime(completedDeals),
  }

  // Group deals by stage
  const dealsByStage = groupDealsByStage(allDeals)

  // Group deals by type
  const dealsByType = groupDealsByType(deals)

  // Group deals by priority
  const dealsByPriority = groupDealsByPriority(activeDeals)

  // Get top sponsors
  const topSponsors = await getTopSponsors(userId, start, end)

  // Calculate revenue over time
  const revenueOverTime = calculateRevenueOverTime(deals, start, end)

  // Calculate deal flow
  const dealFlow = calculateDealFlow(allDeals, start, end)

  // Calculate performance metrics
  const performanceMetrics = calculatePerformanceMetrics(allDeals)

  // Calculate stage metrics
  const stageMetrics = calculateStageMetrics(allDeals)

  return {
    overview,
    dealsByStage,
    dealsByType,
    dealsByPriority,
    topSponsors,
    revenueOverTime,
    dealFlow,
    performanceMetrics,
    stageMetrics,
  }
}

function calculateAverageCycleTime(completedDeals: any[]): number {
  if (completedDeals.length === 0) return 0

  const totalDays = completedDeals.reduce((sum, deal) => {
    const start = new Date(deal.createdAt)
    const end = deal.stage === 'COMPLETED' ? new Date(deal.stageUpdatedAt) : new Date()
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  return Math.round(totalDays / completedDeals.length)
}

function groupDealsByStage(deals: any[]) {
  const stages = [
    'NEW_LEADS',
    'INITIAL_CONTACT',
    'NEGOTIATION',
    'CONTRACT_REVIEW',
    'CONTENT_CREATION',
    'REVIEW_APPROVAL',
    'PUBLISHING',
    'PAYMENT_PENDING',
    'COMPLETED',
  ]

  const grouped = stages.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage)
    const value = stageDeals.reduce((sum, deal) => sum + Number(deal.dealValue), 0)
    
    return {
      stage: stage.replace(/_/g, ' '),
      count: stageDeals.length,
      value,
      percentage: deals.length > 0 ? (stageDeals.length / deals.length) * 100 : 0,
    }
  })

  return grouped
}

function groupDealsByType(deals: any[]) {
  const types = {} as Record<string, { count: number; value: number }>

  deals.forEach((deal) => {
    if (!types[deal.dealType]) {
      types[deal.dealType] = { count: 0, value: 0 }
    }
    types[deal.dealType].count++
    types[deal.dealType].value += Number(deal.dealValue)
  })

  return Object.entries(types)
    .map(([type, data]) => ({
      type: type.replace(/_/g, ' '),
      count: data.count,
      value: data.value,
    }))
    .sort((a, b) => b.value - a.value)
}

function groupDealsByPriority(deals: any[]) {
  const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']
  
  return priorities.map((priority) => {
    const priorityDeals = deals.filter((deal) => deal.priority === priority)
    const value = priorityDeals.reduce((sum, deal) => sum + Number(deal.dealValue), 0)
    
    return {
      priority,
      count: priorityDeals.length,
      value,
    }
  })
}

async function getTopSponsors(userId: string, startDate: Date, endDate: Date) {
  const sponsors = await prisma.sponsor.findMany({
    where: {
      deals: {
        some: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
      },
    },
    include: {
      deals: {
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
      },
    },
  })

  return sponsors
    .map((sponsor) => {
      const totalValue = sponsor.deals.reduce(
        (sum, deal) => sum + Number(deal.dealValue),
        0
      )
      return {
        id: sponsor.id,
        name: sponsor.name,
        companyName: sponsor.companyName,
        dealCount: sponsor.deals.length,
        totalValue,
        averageValue: sponsor.deals.length > 0 ? totalValue / sponsor.deals.length : 0,
      }
    })
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
}

function calculateRevenueOverTime(deals: any[], startDate: Date, endDate: Date) {
  const interval = endDate.getTime() - startDate.getTime()
  const dayInterval = interval / (1000 * 60 * 60 * 24)
  
  // Use monthly grouping for periods over 90 days
  if (dayInterval > 90) {
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthDeals = deals.filter(
        (deal) =>
          deal.stage === 'COMPLETED' &&
          deal.stageUpdatedAt >= monthStart &&
          deal.stageUpdatedAt <= monthEnd
      )
      
      const revenue = monthDeals.reduce(
        (sum, deal) => sum + Number(deal.amountPaid),
        0
      )
      
      return {
        date: format(month, 'MMM yyyy'),
        revenue,
        dealCount: monthDeals.length,
      }
    })
  } else {
    // Use daily grouping for shorter periods
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    return days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)
      
      const dayDeals = deals.filter(
        (deal) =>
          deal.stage === 'COMPLETED' &&
          deal.stageUpdatedAt >= dayStart &&
          deal.stageUpdatedAt <= dayEnd
      )
      
      const revenue = dayDeals.reduce(
        (sum, deal) => sum + Number(deal.amountPaid),
        0
      )
      
      return {
        date: format(day, 'MMM dd'),
        revenue,
        dealCount: dayDeals.length,
      }
    })
  }
}

function calculateDealFlow(deals: any[], startDate: Date, endDate: Date) {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  return days.map((day) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    
    const created = deals.filter(
      (deal) => deal.createdAt >= dayStart && deal.createdAt <= dayEnd
    ).length
    
    const completed = deals.filter(
      (deal) =>
        deal.stage === 'COMPLETED' &&
        deal.stageUpdatedAt >= dayStart &&
        deal.stageUpdatedAt <= dayEnd
    ).length
    
    const cancelled = deals.filter(
      (deal) =>
        deal.deletedAt &&
        deal.deletedAt >= dayStart &&
        deal.deletedAt <= dayEnd
    ).length
    
    return {
      date: format(day, 'MMM dd'),
      created,
      completed,
      cancelled,
    }
  })
}

function calculatePerformanceMetrics(deals: any[]) {
  const totalDeals = deals.length
  const wonDeals = deals.filter((deal) => deal.stage === 'COMPLETED').length
  const lostDeals = deals.filter((deal) => deal.deletedAt).length
  const activeDeals = deals.filter(
    (deal) => !deal.deletedAt && !deal.isArchived && deal.stage !== 'COMPLETED'
  )
  
  const now = new Date()
  const overdueDeals = activeDeals.filter(
    (deal) => deal.contentDueDate && new Date(deal.contentDueDate) < now
  ).length
  
  const upcomingDeadlines = activeDeals.filter((deal) => {
    if (!deal.contentDueDate) return false
    const dueDate = new Date(deal.contentDueDate)
    const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilDue >= 0 && daysUntilDue <= 7
  }).length
  
  const completedDeals = deals.filter((deal) => deal.stage === 'COMPLETED')
  const averageTimeToClose = calculateAverageCycleTime(completedDeals)
  
  return {
    winRate: totalDeals > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0,
    averageTimeToClose,
    dealsInProgress: activeDeals.length,
    overdueDeals,
    upcomingDeadlines,
  }
}

function calculateStageMetrics(deals: any[]) {
  const stages = [
    'NEW_LEADS',
    'INITIAL_CONTACT',
    'NEGOTIATION',
    'CONTRACT_REVIEW',
    'CONTENT_CREATION',
    'REVIEW_APPROVAL',
    'PUBLISHING',
    'PAYMENT_PENDING',
    'COMPLETED',
  ]
  
  return stages.map((stage, index) => {
    const stageDeals = deals.filter((deal) => deal.stage === stage)
    
    // Calculate average time in stage
    let averageTime = 0
    if (stageDeals.length > 0) {
      const totalTime = stageDeals.reduce((sum, deal) => {
        // Find time spent in this stage from history
        const stageTime = calculateTimeInStage(deal, stage)
        return sum + stageTime
      }, 0)
      averageTime = totalTime / stageDeals.length
    }
    
    // Calculate conversion rate to next stage
    let conversion = 0
    if (index < stages.length - 1) {
      const nextStages = stages.slice(index + 1)
      const advancedDeals = deals.filter((deal) =>
        nextStages.includes(deal.stage) ||
        deal.stageHistory.some((h: any) => nextStages.includes(h.toStage))
      )
      conversion = stageDeals.length > 0 ? (advancedDeals.length / stageDeals.length) * 100 : 0
    }
    
    return {
      stage: stage.replace(/_/g, ' '),
      averageTime,
      deals: stageDeals.length,
      conversion,
    }
  })
}

function calculateTimeInStage(deal: any, stage: string): number {
  // If currently in this stage
  if (deal.stage === stage) {
    const start = deal.stageUpdatedAt
    const now = new Date()
    return Math.ceil((now.getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
  }
  
  // Check history for time spent in stage
  const history = deal.stageHistory.find((h: any) => h.toStage === stage)
  if (history && history.durationInStage) {
    // Parse PostgreSQL interval to days
    // This is simplified - in production you'd parse the interval properly
    return 1 // Placeholder
  }
  
  return 0
}
