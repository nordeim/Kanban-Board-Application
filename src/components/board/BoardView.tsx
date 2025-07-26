'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  DropAnimation,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import { BoardColumn } from './BoardColumn'
import { DealCard } from './DealCard'
import { DealWithRelations } from '@/types/deals'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { updateDealStage } from '@/app/actions/deals'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface BoardViewProps {
  initialDeals: DealWithRelations[]
  userId: string
}

const STAGES = [
  { id: 'NEW_LEADS', title: 'New Leads', color: 'bg-slate-500' },
  { id: 'INITIAL_CONTACT', title: 'Initial Contact', color: 'bg-blue-500' },
  { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-yellow-500' },
  { id: 'CONTRACT_REVIEW', title: 'Contract Review', color: 'bg-orange-500' },
  { id: 'CONTENT_CREATION', title: 'Content Creation', color: 'bg-purple-500' },
  { id: 'REVIEW_APPROVAL', title: 'Review & Approval', color: 'bg-pink-500' },
  { id: 'PUBLISHING', title: 'Publishing', color: 'bg-green-500' },
  { id: 'PAYMENT_PENDING', title: 'Payment Pending', color: 'bg-red-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-500' },
] as const

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

export function BoardView({ initialDeals, userId }: BoardViewProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [deals, setDeals] = React.useState<DealWithRelations[]>(initialDeals)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  
  // Apply filters from URL params
  const filteredDeals = React.useMemo(() => {
    let filtered = [...deals]
    
    // Search filter
    const search = searchParams.get('search')
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchLower) ||
          deal.description?.toLowerCase().includes(searchLower) ||
          deal.sponsor.name.toLowerCase().includes(searchLower)
      )
    }
    
    // Sponsor filter
    const sponsors = searchParams.get('sponsors')?.split(',').filter(Boolean)
    if (sponsors?.length) {
      filtered = filtered.filter((deal) => sponsors.includes(deal.sponsorId))
    }
    
    // Tag filter
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    if (tags?.length) {
      filtered = filtered.filter((deal) =>
        deal.tags.some((tag) => tags.includes(tag.id))
      )
    }
    
    // Priority filter
    const priorities = searchParams.get('priorities')?.split(',').filter(Boolean)
    if (priorities?.length) {
      filtered = filtered.filter((deal) => priorities.includes(deal.priority))
    }
    
    // Stage filter
    const stages = searchParams.get('stages')?.split(',').filter(Boolean)
    if (stages?.length) {
      filtered = filtered.filter((deal) => stages.includes(deal.stage))
    }
    
    // Sort
    const sortBy = searchParams.get('sort') || 'updated'
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'value':
          return Number(b.dealValue) - Number(a.dealValue)
        case 'priority':
          const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'dueDate':
          if (!a.contentDueDate) return 1
          if (!b.contentDueDate) return -1
          return new Date(a.contentDueDate).getTime() - new Date(b.contentDueDate).getTime()
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })
    
    return filtered
  }, [deals, searchParams])
  
  // Group deals by stage
  const dealsByStage = React.useMemo(() => {
    const grouped: Record<string, DealWithRelations[]> = {}
    STAGES.forEach((stage) => {
      grouped[stage.id] = []
    })
    
    filteredDeals.forEach((deal) => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal)
      }
    })
    
    return grouped
  }, [filteredDeals])
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )
  
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null)
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)
    
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    const activeDeal = deals.find((d) => d.id === activeId)
    if (!activeDeal) return
    
    // Determine the target stage
    let targetStage: string
    if (STAGES.some((s) => s.id === overId)) {
      // Dropped on a column
      targetStage = overId
    } else {
      // Dropped on a card - find its stage
      const overDeal = deals.find((d) => d.id === overId)
      if (!overDeal) return
      targetStage = overDeal.stage
    }
    
    if (activeDeal.stage === targetStage) {
      // Reorder within the same column
      const column = dealsByStage[targetStage]
      const oldIndex = column.findIndex((d) => d.id === activeId)
      const newIndex = column.findIndex((d) => d.id === overId)
      
      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const newColumn = arrayMove(column, oldIndex, newIndex)
        const newDeals = deals.map((deal) => {
          const index = newColumn.findIndex((d) => d.id === deal.id)
          if (index !== -1) {
            return { ...deal }
          }
          return deal
        })
        setDeals(newDeals)
      }
    } else {
      // Move to a different stage
      try {
        // Optimistic update
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === activeId ? { ...deal, stage: targetStage as any } : deal
          )
        )
        
        // Server update
        const result = await updateDealStage(activeId, targetStage as any)
        
        if (!result.success) {
          // Revert on error
          setDeals(initialDeals)
          toast({
            title: 'Error',
            description: result.error || 'Failed to update deal stage',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Success',
            description: 'Deal moved successfully',
          })
        }
      } catch (error) {
        // Revert on error
        setDeals(initialDeals)
        toast({
          title: 'Error',
          description: 'Failed to update deal stage',
          variant: 'destructive',
        })
      }
    }
  }
  
  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <ScrollArea className="flex-1">
        <div className="flex h-full gap-4 p-4">
          {STAGES.map((stage) => (
            <BoardColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              color={stage.color}
              deals={dealsByStage[stage.id] || []}
              isOver={overId === stage.id}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <DragOverlay dropAnimation={dropAnimation}>
        {activeDeal ? (
          <div className="cursor-grabbing">
            <DealCard deal={activeDeal} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
