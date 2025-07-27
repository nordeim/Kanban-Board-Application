'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/auth'
import { dealSchema, updateDealSchema, type DealFormData } from '@/lib/validations/deal'

export async function createDeal(data: DealFormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Validate data
    const validatedData = dealSchema.parse(data)

    // Handle new sponsor creation
    let sponsorId = validatedData.sponsorId
    if (!sponsorId && validatedData.newSponsor) {
      const sponsor = await prisma.sponsor.create({
        data: {
          name: validatedData.newSponsor.name,
          companyName: validatedData.newSponsor.companyName,
          primaryContactName: validatedData.newSponsor.contactName,
          primaryContactEmail: validatedData.newSponsor.contactEmail,
          website: validatedData.newSponsor.website,
          createdById: user.id,
        },
      })
      sponsorId = sponsor.id
    }

    if (!sponsorId) {
      throw new Error('Sponsor is required')
    }

    // Create deal in transaction
    const deal = await prisma.$transaction(async (tx) => {
      // Create the deal
      const newDeal = await tx.deal.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          userId: user.id,
          sponsorId,
          dealType: validatedData.dealType,
          dealValue: validatedData.dealValue,
          currency: validatedData.currency,
          commissionRate: validatedData.commissionRate,
          stage: validatedData.stage,
          priority: validatedData.priority,
          startDate: validatedData.startDate,
          contentDueDate: validatedData.contentDueDate,
          publishDate: validatedData.publishDate,
          paymentDueDate: validatedData.paymentDueDate,
          paymentTerms: validatedData.paymentTerms,
          videoTitle: validatedData.videoTitle,
          videoDescription: validatedData.videoDescription,
          videoLengthSeconds: validatedData.videoLengthSeconds,
          platforms: validatedData.platforms,
          contentRequirements: validatedData.contentRequirements,
          talkingPoints: validatedData.talkingPoints,
          restrictedTopics: validatedData.restrictedTopics,
          brandGuidelinesUrl: validatedData.brandGuidelinesUrl,
          assignedToId: validatedData.assignedToId,
          requiresApproval: validatedData.requiresApproval,
          autoPublish: validatedData.autoPublish,
          isUrgent: validatedData.isUrgent,
          customFields: validatedData.customFields,
        },
      })

      // Add tags
      if (validatedData.tags.length > 0) {
        await tx.dealTag.createMany({
          data: validatedData.tags.map((tagId) => ({
            dealId: newDeal.id,
            tagId,
          })),
        })
      }

      // Create activity log
      await tx.activity.create({
        data: {
          dealId: newDeal.id,
          userId: user.id,
          activityType: 'CREATED',
          description: `Created deal "${newDeal.title}"`,
          metadata: {
            dealValue: newDeal.dealValue,
            stage: newDeal.stage,
            priority: newDeal.priority,
          },
        },
      })

      // Create notification for assigned user
      if (newDeal.assignedToId && newDeal.assignedToId !== user.id) {
        await tx.notification.create({
          data: {
            userId: newDeal.assignedToId,
            type: 'DEAL_ASSIGNED',
            title: 'New deal assigned to you',
            message: `You've been assigned to "${newDeal.title}"`,
            dealId: newDeal.id,
            actionUrl: `/deals/${newDeal.id}`,
          },
        })
      }

      return newDeal
    })

    revalidatePath('/board')
    revalidatePath('/deals')
    
    return { success: true, dealId: deal.id }
  } catch (error) {
    console.error('Failed to create deal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create deal',
    }
  }
}

export async function updateDeal(dealId: string, data: Partial<DealFormData>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Check permissions
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id: dealId,
        OR: [
          { userId: user.id },
          { assignedToId: user.id },
        ],
        deletedAt: null,
      },
    })

    if (!existingDeal) {
      throw new Error('Deal not found or access denied')
    }

    // Validate data
    const validatedData = updateDealSchema.parse(data)

    // Update deal in transaction
    await prisma.$transaction(async (tx) => {
      // Update the deal
      await tx.deal.update({
        where: { id: dealId },
        data: validatedData,
      })

      // Update tags if provided
      if (validatedData.tags !== undefined) {
        // Remove existing tags
        await tx.dealTag.deleteMany({
          where: { dealId },
        })

        // Add new tags
        if (validatedData.tags.length > 0) {
          await tx.dealTag.createMany({
            data: validatedData.tags.map((tagId) => ({
              dealId,
              tagId,
            })),
          })
        }
      }

      // Create activity log
      await tx.activity.create({
        data: {
          dealId,
          userId: user.id,
          activityType: 'UPDATED',
          description: 'Updated deal details',
          metadata: validatedData,
        },
      })

      // Notify assigned user if changed
      if (
        validatedData.assignedToId &&
        validatedData.assignedToId !== existingDeal.assignedToId &&
        validatedData.assignedToId !== user.id
      ) {
        await tx.notification.create({
          data: {
            userId: validatedData.assignedToId,
            type: 'DEAL_ASSIGNED',
            title: 'Deal assigned to you',
            message: `You've been assigned to "${existingDeal.title}"`,
            dealId,
            actionUrl: `/deals/${dealId}`,
          },
        })
      }
    })

    revalidatePath('/board')
    revalidatePath(`/deals/${dealId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update deal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update deal',
    }
  }
}

export async function deleteDeal(dealId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Soft delete
    await prisma.deal.update({
      where: {
        id: dealId,
        userId: user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    revalidatePath('/board')
    revalidatePath('/deals')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete deal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete deal',
    }
  }
}

export async function archiveDeal(dealId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await prisma.deal.update({
      where: {
        id: dealId,
        userId: user.id,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    })

    revalidatePath('/board')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to archive deal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive deal',
    }
  }
}
