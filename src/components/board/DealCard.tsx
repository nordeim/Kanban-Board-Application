'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Calendar,
  DollarSign,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Archive,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow, isPast, isWithinInterval, subDays } from 'date-fns'

import { cn, formatCurrency, getPriorityInfo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DealWithRelations } from '@/types/deals'
import { useDragHandle } from '@/lib/hooks/useDragHandle'

interface DealCardProps {
  deal: DealWithRelations
  isDragging?: boolean
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      deal,
    },
  })
  
  const { attributes: dragAttributes, listeners: dragListeners } = useDragHandle()
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const priorityInfo = getPriorityInfo(deal.priority)
  
  // Calculate urgency indicators
  const daysUntilDue = deal.contentDueDate
    ? Math.ceil(
        (new Date(deal.contentDueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null
    
  const isOverdue = deal.contentDueDate && isPast(new Date(deal.contentDueDate))
  const isDueSoon = deal.contentDueDate && isWithinInterval(new Date(deal.contentDueDate), {
    start: new Date(),
    end: subDays(new Date(), -3),
  })
  
  // Calculate stage duration
  const stageDuration = formatDistanceToNow(new Date(deal.stageUpdatedAt), {
    addSuffix: false,
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-manipulation',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      <Card
        className={cn(
          'group cursor-grab transition-all hover:shadow-md',
          (isDragging || isSortableDragging) && 'cursor-grabbing shadow-lg',
          isOverdue && 'border-destructive'
        )}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="space-y-1 p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {deal.sponsor.logoUrl ? (
                  <AvatarImage src={deal.sponsor.logoUrl} alt={deal.sponsor.name} />
                ) : (
                  <AvatarFallback className="text-xs">
                    {deal.sponsor.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-medium">{deal.title}</h4>
                <p className="truncate text-xs text-muted-foreground">
                  {deal.sponsor.name}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/deals/${deal.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-3 pt-0">
          {/* Deal value and priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-medium">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              {formatCurrency(Number(deal.dealValue))}
            </div>
            <Badge
              variant="outline"
              className={cn('text-xs', priorityInfo.bgColor, priorityInfo.color)}
            >
              {deal.priority}
            </Badge>
          </div>
          
          {/* Due date and stage duration */}
          <div className="space-y-1">
            {deal.contentDueDate && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className={cn(
                  'h-3 w-3',
                  isOverdue && 'text-destructive',
                  isDueSoon && 'text-warning'
                )} />
                <span className={cn(
                  isOverdue && 'text-destructive font-medium',
                  isDueSoon && 'text-warning'
                )}>
                  {isOverdue ? 'Overdue' : `Due in ${daysUntilDue} days`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              In stage for {stageDuration}
            </div>
          </div>
          
          {/* Tags */}
          {deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="h-5 px-1.5 text-xs"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  +{deal.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Footer actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {deal.commentCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deal.commentCount} comments</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {deal.attachmentCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deal.attachmentCount} attachments</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {deal.assignedTo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    {deal.assignedTo.image ? (
                      <AvatarImage src={deal.assignedTo.image} alt={deal.assignedTo.name || ''} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {(deal.assignedTo.name || 'U').substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assigned to {deal.assignedTo.name || 'Unknown'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Urgent indicator */}
          {(deal.priority === 'URGENT' || isOverdue) && (
            <div className="flex items-center gap-1 rounded-md bg-destructive/10 p-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {isOverdue ? 'Overdue - needs immediate attention' : 'Urgent - handle immediately'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
