/**
 * Utility Functions
 * Core utilities used throughout the application
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance, formatRelative } from 'date-fns'

/**
 * Combines class names with tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format dates consistently across the app
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = 'PPP'
): string {
  if (!date) return 'Not set'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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
 * Generate a random ID (for client-side operations)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Get stage color based on stage name
 */
export function getStageColor(stage: string): string {
  const stageColors: Record<string, string> = {
    NEW_LEADS: 'bg-slate-500',
    INITIAL_CONTACT: 'bg-blue-500',
    NEGOTIATION: 'bg-yellow-500',
    CONTRACT_REVIEW: 'bg-orange-500',
    CONTENT_CREATION: 'bg-purple-500',
    REVIEW_APPROVAL: 'bg-pink-500',
    PUBLISHING: 'bg-green-500',
    PAYMENT_PENDING: 'bg-red-500',
    COMPLETED: 'bg-emerald-500',
  }
  return stageColors[stage] || 'bg-gray-500'
}

/**
 * Get priority color and icon
 */
export function getPriorityInfo(priority: string): {
  color: string
  bgColor: string
  icon: string
} {
  const priorityMap = {
    LOW: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: 'arrow-down' },
    MEDIUM: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: 'minus' },
    HIGH: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: 'arrow-up' },
    URGENT: { color: 'text-red-600', bgColor: 'bg-red-100', icon: 'alert-circle' },
  }
  return priorityMap[priority as keyof typeof priorityMap] || priorityMap.MEDIUM
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sleep utility for testing loading states
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
