'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/auth'
import { DealStage } from '@prisma/client'

export async function updateDealStage(dealId: string, newStage: DealStage) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if user has permission to update this deal
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { userId: true, assignedToId: true, stage: true },
    })

    if (!deal) {
      return { success: false, error: 'Deal not found' }
    }

    if (deal.userId !== user.id && deal.assignedToId !== user.id) {
      return { success: false, error: 'You do not have permission to update this deal' }
    }

    // Update deal and create stage history entry in a transaction
    await prisma.$transaction(async (tx) => {
      // Create stage history
      await tx.dealStageHistory.create({
        data: {
          dealId,
          fromStage: deal.stage,
          toStage: newStage,
          changedById: user.id,
        },
      })

      // Update deal
      await tx.deal.update({
        where: { id: dealId },
        data: {
          stage: newStage,
          stageUpdatedAt: new Date(),
        },
      })

      // Create activity log
      await tx.activity.create({
        data: {
          dealId,
          userId: user.id,
          activityType: 'STAGE_CHANGED',
          description: `Deal moved from ${deal.stage.replace(/_/g, ' ')} to ${newStage.replace(/_/g, ' ')}`,
          metadata: {
            fromStage: deal.stage,
            toStage: newStage,
          },
        },
      })
    })

    revalidatePath('/board')
    return { success: true }
  } catch (error) {
    console.error('Failed to update deal stage:', error)
    return { success: false, error: 'Failed to update deal stage' }
  }
}
