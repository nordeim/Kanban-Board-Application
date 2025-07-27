import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { dealFilterSchema } from '@/lib/validations/deal'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const filters = dealFilterSchema.parse({
      search: searchParams.get('search'),
      sponsorIds: searchParams.getAll('sponsorIds'),
      tagIds: searchParams.getAll('tagIds'),
      stages: searchParams.getAll('stages'),
      priorities: searchParams.getAll('priorities'),
      dealTypes: searchParams.getAll('dealTypes'),
      minValue: searchParams.get('minValue')
        ? Number(searchParams.get('minValue'))
        : undefined,
      maxValue: searchParams.get('maxValue')
        ? Number(searchParams.get('maxValue'))
        : undefined,
      assignedToId: searchParams.get('assignedToId'),
      isArchived: searchParams.get('isArchived') === 'true',
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    })

    // Build where clause
    const where: Prisma.DealWhereInput = {
      userId: user.id,
      deletedAt: null,
      isArchived: filters.isArchived,
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          sponsor: {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { companyName: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    // Other filters
    if (filters.sponsorIds?.length) {
      where.sponsorId = { in: filters.sponsorIds }
    }

    if (filters.tagIds?.length) {
      where.tags = {
        some: {
          tagId: { in: filters.tagIds },
        },
      }
    }

    if (filters.stages?.length) {
      where.stage = { in: filters.stages }
    }

    if (filters.priorities?.length) {
      where.priority = { in: filters.priorities }
    }

    if (filters.dealTypes?.length) {
      where.dealType = { in: filters.dealTypes }
    }

    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      where.dealValue = {}
      if (filters.minValue !== undefined) {
        where.dealValue.gte = filters.minValue
      }
      if (filters.maxValue !== undefined) {
        where.dealValue.lte = filters.maxValue
      }
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId
    }

    // Count total items
    const totalCount = await prisma.deal.count({ where })

    // Build orderBy
    const orderBy: Prisma.DealOrderByWithRelationInput = {}
    switch (filters.sortBy) {
      case 'created':
        orderBy.createdAt = filters.sortOrder || 'desc'
        break
      case 'value':
        orderBy.dealValue = filters.sortOrder || 'desc'
        break
      case 'priority':
        // Custom priority ordering would be handled differently
        orderBy.priority = filters.sortOrder || 'desc'
        break
      case 'dueDate':
        orderBy.contentDueDate = filters.sortOrder || 'asc'
        break
      default:
        orderBy.updatedAt = filters.sortOrder || 'desc'
    }

    // Fetch deals with pagination
    const deals = await prisma.deal.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        sponsor: true,
        assignedTo: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    })

    // Transform the response
    const transformedDeals = deals.map((deal) => ({
      ...deal,
      tags: deal.tags.map((dt) => dt.tag),
      commentCount: deal._count.comments,
      attachmentCount: deal._count.attachments,
    }))

    return NextResponse.json({
      deals: transformedDeals,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Handle new sponsor creation
    let sponsorId = body.sponsorId
    if (!sponsorId && body.newSponsor) {
      const sponsor = await prisma.sponsor.create({
        data: {
          ...body.newSponsor,
          createdById: user.id,
        },
      })
      sponsorId = sponsor.id
    }

    // Create the deal
    const deal = await prisma.deal.create({
      data: {
        title: body.title,
        description: body.description,
        userId: user.id,
        sponsorId,
        dealType: body.dealType,
        dealValue: body.dealValue,
        currency: body.currency,
        commissionRate: body.commissionRate,
        stage: body.stage,
        priority: body.priority,
        startDate: body.startDate,
        contentDueDate: body.contentDueDate,
        publishDate: body.publishDate,
        paymentDueDate: body.paymentDueDate,
        paymentTerms: body.paymentTerms,
        videoTitle: body.videoTitle,
        videoDescription: body.videoDescription,
        videoLengthSeconds: body.videoLengthSeconds,
        platforms: body.platforms,
        contentRequirements: body.contentRequirements,
        talkingPoints: body.talkingPoints,
        restrictedTopics: body.restrictedTopics,
        brandGuidelinesUrl: body.brandGuidelinesUrl,
        assignedToId: body.assignedToId,
        requiresApproval: body.requiresApproval,
        autoPublish: body.autoPublish,
        isUrgent: body.isUrgent,
        customFields: body.customFields,
      },
      include: {
        sponsor: true,
        assignedTo: true,
      },
    })

    // Add tags
    if (body.tags?.length) {
      await prisma.dealTag.createMany({
        data: body.tags.map((tagId: string) => ({
          dealId: deal.id,
          tagId,
        })),
      })
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        dealId: deal.id,
        userId: user.id,
        activityType: 'CREATED',
        description: `Created deal "${deal.title}"`,
        metadata: {
          dealValue: deal.dealValue,
          stage: deal.stage,
        },
      },
    })

    // Create notification for assigned user
    if (deal.assignedToId && deal.assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: deal.assignedToId,
          type: 'DEAL_ASSIGNED',
          title: 'New deal assigned to you',
          message: `You've been assigned to "${deal.title}"`,
          dealId: deal.id,
          actionUrl: `/deals/${deal.id}`,
        },
      })
    }

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
