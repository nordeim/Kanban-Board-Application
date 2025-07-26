import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function useDragDrop(id: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  }
}

export function useDragHandle() {
  const [isDragging, setIsDragging] = React.useState(false)
  
  const attributes = {
    role: 'button',
    tabIndex: 0,
    'aria-describedby': 'drag-handle',
    'aria-pressed': isDragging,
    'aria-roledescription': 'draggable',
  }
  
  const listeners = {
    onPointerDown: () => setIsDragging(true),
    onPointerUp: () => setIsDragging(false),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setIsDragging(true)
      }
    },
    onKeyUp: () => setIsDragging(false),
  }
  
  return {
    attributes,
    listeners,
    isDragging,
  }
}
