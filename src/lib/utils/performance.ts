import { cache } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * Memoized data fetching for server components
 * Uses React's cache API for request deduplication
 */
export const getCachedDeals = cache(async (userId: string) => {
  const { prisma } = await import('@/lib/db/prisma')
  
  return prisma.deal.findMany({
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
})

export const getCachedSponsors = cache(async (userId: string) => {
  const { prisma } = await import('@/lib/db/prisma')
  
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
      logoUrl: true,
    },
    orderBy: { name: 'asc' },
  })
})

export const getCachedTags = cache(async () => {
  const { prisma } = await import('@/lib/db/prisma')
  
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
    orderBy: { name: 'asc' },
  })
})

/**
 * Debounce function for search and other frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll and resize events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Lazy load components with loading states
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFunc, {
    loading: () => fallback || <div>Loading...</div>,
    ssr: true,
  })
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
  }
}

/**
 * Image optimization with blur placeholder
 */
export async function getOptimizedImageProps(src: string) {
  try {
    const { getPlaiceholder } = await import('plaiceholder')
    const { base64, img } = await getPlaiceholder(src)
    
    return {
      ...img,
      blurDataURL: base64,
      placeholder: 'blur' as const,
    }
  } catch {
    return { src }
  }
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }) as T
}

/**
 * Batch API calls
 */
export function createBatchProcessor<T, R>(
  processBatch: (items: T[]) => Promise<R[]>,
  delay = 10
) {
  let batch: { item: T; resolve: (value: R) => void; reject: (error: any) => void }[] = []
  let timeout: NodeJS.Timeout | null = null

  const processPendingBatch = async () => {
    const currentBatch = batch
    batch = []
    timeout = null

    try {
      const results = await processBatch(currentBatch.map(({ item }) => item))
      currentBatch.forEach(({ resolve }, index) => resolve(results[index]))
    } catch (error) {
      currentBatch.forEach(({ reject }) => reject(error))
    }
  }

  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      batch.push({ item, resolve, reject })

      if (!timeout) {
        timeout = setTimeout(processPendingBatch, delay)
      }
    })
  }
}

/**
 * Prefetch data on hover
 */
export function usePrefetch() {
  const router = useRouter()
  
  return React.useCallback((href: string) => {
    router.prefetch(href)
  }, [router])
}

/**
 * Service Worker registration for offline support
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}
