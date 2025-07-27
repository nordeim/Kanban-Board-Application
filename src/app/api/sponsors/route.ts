import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sponsors = await prisma.sponsor.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { deals: { some: { userId: user.id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        logoUrl: true,
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}
