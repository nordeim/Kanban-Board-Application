'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/components/ui/use-toast'
import { DealWithRelations } from '@/types/deals'

interface RealtimeEvent {
  type: 'DEAL_CREATED' | 'DEAL_UPDATED' | 'DEAL_DELETED' | 'DEAL_MOVED'
  dealId: string
  data?: Partial<DealWithRelations>
  userId?: string
  metadata?: Record<string, any>
}

export function useRealtimeDeals(userId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      auth: {
        userId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('Connected to realtime server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from realtime server')
      setIsConnected(false)
    })

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error)
      toast({
        title: 'Connection Error',
        description: 'Lost connection to realtime updates',
        variant: 'destructive',
      })
    })

    // Handle deal events
    socketInstance.on('deal:created', (event: RealtimeEvent) => {
      if (event.userId !== userId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        toast({
          title: 'New Deal Created',
          description: `A new deal "${event.data?.title}" has been added`,
        })
      }
    })

    socketInstance.on('deal:updated', (event: RealtimeEvent) => {
      if (event.userId !== userId) {
        queryClient.invalidateQueries({ queryKey: ['deals', event.dealId] })
        queryClient.invalidateQueries({ queryKey: ['deals'] })
      }
    })

    socketInstance.on('deal:moved', (event: RealtimeEvent) => {
      if (event.userId !== userId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        const { fromStage, toStage } = event.metadata || {}
        toast({
          title: 'Deal Moved',
          description: `"${event.data?.title}" moved from ${fromStage} to ${toStage}`,
        })
      }
    })

    socketInstance.on('deal:deleted', (event: RealtimeEvent) => {
      if (event.userId !== userId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
        toast({
          title: 'Deal Deleted',
          description: `A deal has been removed`,
          variant: 'destructive',
        })
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, queryClient, toast])

  // Emit events
  const emit = React.useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }, [socket, isConnected])

  // Subscribe to specific deal updates
  const subscribeToDeal = React.useCallback((dealId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe:deal', { dealId })
    }
  }, [socket, isConnected])

  const unsubscribeFromDeal = React.useCallback((dealId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe:deal', { dealId })
    }
  }, [socket, isConnected])

  return {
    isConnected,
    emit,
    subscribeToDeal,
    unsubscribeFromDeal,
  }
}
