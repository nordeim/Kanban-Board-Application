'use client'

import * as React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MoreHorizontal, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DealCard } from './DealCard'
import { DealWithRelations } from '@/types/deals'

interface BoardColumnProps {
  id: string
  title: string
  color: string
  deals: DealWithRelations[]
  isOver?: boolean
}

export function BoardColumn({ id, title, color, deals, isOver }: BoardColumnProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id,
    data: {
      type: 'column',
      accepts: ['deal'],
    },
  })
  
  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.dealValue), 0)
  const urgentCount = deals.filter(
    (deal) => deal.priority === 'URGENT' || deal.priority === 'HIGH'
  ).length

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full w-[320px] flex-shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors',
        (isOver || isDroppableOver) && 'border-primary bg-muted/50 ring-2 ring-primary/20'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b bg-background/50 p-3">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', color)} />
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {deals.length}
          </Badge>
          {urgentCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {urgentCount} urgent
            </Badge>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              Add deal to {title}
            </DropdownMenuItem>
            <DropdownMenuItem>Sort by priority</DropdownMenuItem>
            <DropdownMenuItem>Sort by value</DropdownMenuItem>
            <DropdownMenuItem>Sort by date</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Column stats */}
      <div className="border-b bg-background/30 px-3 py-2 text-xs text-muted-foreground">
        Total value: ${totalValue.toLocaleString()}
      </div>
      
      {/* Deals list */}
      <ScrollArea className="flex-1 p-2">
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No deals in {title}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add deal
                </Button>
              </div>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
}
