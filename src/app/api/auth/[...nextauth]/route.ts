/**
 * NextAuth API Route
 * Handles all authentication endpoints
 */

import { handlers } from '@/lib/auth/auth'

// Export NextAuth handlers for the App Router
export const { GET, POST } = handlers
