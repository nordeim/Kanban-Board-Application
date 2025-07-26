import type { Deal, Sponsor, User, Tag } from '@prisma/client'

export interface DealWithRelations extends Deal {
  sponsor: Sponsor
  assignedTo: User | null
  tags: Tag[]
  commentCount: number
  attachmentCount: number
}

export interface BoardColumn {
  id: string
  title: string
  color: string
  deals: DealWithRelations[]
}

export interface DragItem {
  id: string
  type: 'deal'
  deal: DealWithRelations
}
