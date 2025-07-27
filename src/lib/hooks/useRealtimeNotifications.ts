'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  actionUrl?: string
  createdAt: string
}

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  React.useEffect(() => {
    // Use EventSource for Server-Sent Events
    const eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`)

    eventSource.onopen = () => {
      console.log('Connected to notification stream')
    }

    eventSource.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data)
      
      // Add to local state
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Show toast
      toast({
        title: notification.title,
        description: notification.message,
        action: notification.actionUrl ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={notification.actionUrl}>View</Link>
          </Button>
        ) : undefined,
      })
      
      // Play notification sound
      playNotificationSound()
      
      // Show browser notification if permitted
      showBrowserNotification(notification)
    }

    eventSource.onerror = (error) => {
      console.error('Notification stream error:', error)
      eventSource.close()
      
      // Retry connection after delay
      setTimeout(() => {
        // Reconnect logic
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [userId, queryClient, toast])

  const markAsRead = React.useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [queryClient])

  const markAllAsRead = React.useCallback(async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [queryClient])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}

function playNotificationSound() {
  // Play a subtle notification sound
  const audio = new Audio('/sounds/notification.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {
    // Ignore errors (e.g., autoplay blocked)
  })
}

async function showBrowserNotification(notification: Notification) {
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: notification.id,
      requireInteraction: false,
      silent: false,
    })
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      showBrowserNotification(notification)
    }
  }
}
