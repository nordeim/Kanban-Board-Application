import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { prisma, handlePrismaError } from '@/lib/db/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deal = await prisma.deal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        sponsor: true,
        assignedTo: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          include: {
            uploadedBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        stageHistory: {
          include: {
            changedBy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Transform the response
    const transformedDeal = {
      ...deal,
      tags: deal.tags.map((dt) => dt.tag),
    }

    return NextResponse.json(transformedDeal)
  } catch (error) {
    const { message, statusCode } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Check permissions
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Update deal
    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        dealType: body.dealType,
        dealValue: body.dealValue,
        currency: body.currency,
        commissionRate: body.commissionRate,
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Update tags if provided
    if (body.tags !== undefined) {
      // Remove existing tags
      await prisma.dealTag.deleteMany({
        where: { dealId: params.id },
      })

      // Add new tags
      if (body.tags.length > 0) {
        await prisma.dealTag.createMany({
          data: body.tags.map((tagId: string) => ({
            dealId: params.id,
            tagId,
          })),
        })
      }
    }

    // Create activity log
    await prisma.activity.create({
      data: {
        dealId: deal.id,
        userId: user.id,
        activityType: 'UPDATED',
        description: 'Updated deal details',
        metadata: body,
      },
    })

    // Notify assigned user if changed
    if (
      body.assignedToId &&
      body.assignedToId !== existingDeal.assignedToId &&
      body.assignedToId !== user.id
    ) {
      await prisma.notification.create({
        data: {
          userId: body.assignedToId,
          type: 'DEAL_ASSIGNED',
          title: 'Deal assigned to you',
          message: `You've been assigned to "${deal.title}"`,
          dealId: deal.id,
          actionUrl: `/deals/${deal.id}`,
        },
      })
    }

    return NextResponse.json(deal)
  } catch (error) {
    const { message, statusCode } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete
    const deal = await prisma.deal.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        dealId: deal.id,
        userId: user.id,
        activityType: 'DELETED',
        description: `Deleted deal "${deal.title}"`,
      },
    })

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error) {
    const { message, statusCode } = handlePrismaError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
