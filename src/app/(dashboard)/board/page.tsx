import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BoardView } from '@/components/board/BoardView'
import { BoardHeader } from '@/components/board/BoardHeader'
import { BoardSkeleton } from '@/components/board/BoardSkeleton'
import { getServerSession } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { DealWithRelations } from '@/types/deals'

export const metadata: Metadata = {
  title: 'Board',
  description: 'Manage your sponsorship deals with our Kanban board',
}

async function getDeals(userId: string): Promise<DealWithRelations[]> {
  const deals = await prisma.deal.findMany({
    where: {
      userId,
      deletedAt: null,
      isArchived: false,
    },
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
    orderBy: [
      { priority: 'desc' },
      { updatedAt: 'desc' },
    ],
  })

  // Transform the data to match our type
  return deals.map(deal => ({
    ...deal,
    tags: deal.tags.map(dt => dt.tag),
    commentCount: deal._count.comments,
    attachmentCount: deal._count.attachments,
  }))
}

async function getSponsors(userId: string) {
  return prisma.sponsor.findMany({
    where: {
      OR: [
        { createdById: userId },
        { deals: { some: { userId } } },
      ],
    },
    select: {
      id: true,
      name: true,
      companyName: true,
    },
  })
}

async function getTags() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
  })
}

export default async function BoardPage() {
  const session = await getServerSession()
  if (!session?.user) return null

  const [deals, sponsors, tags] = await Promise.all([
    getDeals(session.user.id),
    getSponsors(session.user.id),
    getTags(),
  ])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <BoardHeader
        initialSponsors={sponsors}
        initialTags={tags}
      />
      <Suspense fallback={<BoardSkeleton />}>
        <BoardView initialDeals={deals} userId={session.user.id} />
      </Suspense>
    </div>
  )
}
