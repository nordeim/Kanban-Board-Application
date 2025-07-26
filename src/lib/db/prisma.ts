/**
 * Prisma Client Singleton
 * Ensures single database connection instance across the application
 * Handles both development (with hot reload) and production environments
 */

import { PrismaClient } from '@prisma/client'

// Extend PrismaClient with middleware and logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  }).$extends({
    // Add soft delete middleware
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // Automatically filter out soft-deleted records
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
      },
    },
  }).$extends({
    // Add automatic updated_at handling
    query: {
      $allModels: {
        async update({ args, query }) {
          args.data = { ...args.data, updatedAt: new Date() }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.data = { ...args.data, updatedAt: new Date() }
          return query(args)
        },
      },
    },
  }).$extends({
    // Add model-specific extensions
    model: {
      deal: {
        // Custom method to move deal to next stage
        async moveToNextStage(dealId: string, userId: string) {
          const stageOrder = [
            'NEW_LEADS',
            'INITIAL_CONTACT',
            'NEGOTIATION',
            'CONTRACT_REVIEW',
            'CONTENT_CREATION',
            'REVIEW_APPROVAL',
            'PUBLISHING',
            'PAYMENT_PENDING',
            'COMPLETED'
          ] as const

          const deal = await prisma.deal.findUnique({ where: { id: dealId } })
          if (!deal) throw new Error('Deal not found')

          const currentIndex = stageOrder.indexOf(deal.stage)
          if (currentIndex === stageOrder.length - 1) {
            throw new Error('Deal is already in final stage')
          }

          const nextStage = stageOrder[currentIndex + 1]
          
          // Use transaction to update deal and create history
          return prisma.$transaction(async (tx) => {
            // Create stage history entry
            await tx.dealStageHistory.create({
              data: {
                dealId,
                fromStage: deal.stage,
                toStage: nextStage,
                changedById: userId,
              }
            })

            // Update deal stage
            return tx.deal.update({
              where: { id: dealId },
              data: { 
                stage: nextStage,
                stageUpdatedAt: new Date()
              }
            })
          })
        }
      },
      user: {
        // Custom method to get user with active deals count
        async getWithStats(userId: string) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              _count: {
                select: {
                  ownedDeals: {
                    where: {
                      deletedAt: null,
                      isArchived: false
                    }
                  }
                }
              }
            }
          })

          if (!user) return null

          const dealStats = await prisma.deal.aggregate({
            where: {
              userId,
              deletedAt: null,
              isArchived: false
            },
            _sum: {
              dealValue: true
            },
            _avg: {
              dealValue: true
            }
          })

          return {
            ...user,
            stats: {
              activeDeals: user._count.ownedDeals,
              totalValue: dealStats._sum.dealValue || 0,
              averageValue: dealStats._avg.dealValue || 0
            }
          }
        }
      }
    }
  })
}

// Type for the extended client
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Global store for the Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Export the prisma client instance
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle database errors
export function handlePrismaError(error: unknown): {
  message: string
  code: string
  statusCode: number
} {
  if (error instanceof Error) {
    // Handle specific Prisma errors
    if ('code' in error) {
      const prismaError = error as any
      switch (prismaError.code) {
        case 'P2002':
          return {
            message: 'A record with this value already exists',
            code: 'DUPLICATE_ENTRY',
            statusCode: 409
          }
        case 'P2025':
          return {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404
          }
        case 'P2003':
          return {
            message: 'Invalid reference to related record',
            code: 'INVALID_REFERENCE',
            statusCode: 400
          }
        default:
          return {
            message: 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
          }
      }
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

// Utility to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectPrisma()
})
