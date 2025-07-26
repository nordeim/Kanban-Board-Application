/**
 * NextAuth Instance
 * Main auth configuration using the new NextAuth v5 API
 */

import NextAuth from 'next-auth'
import { authOptions } from './auth-options'

// Create the auth instance
const { auth, handlers, signIn, signOut } = NextAuth(authOptions)

export { auth, handlers, signIn, signOut }

// Helper functions for auth operations
export async function getServerSession() {
  const session = await auth()
  return session
}

export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Role-based access control helpers
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function isAdmin() {
  try {
    await requireRole(['ADMIN'])
    return true
  } catch {
    return false
  }
}

export async function canEditDeal(dealId: string) {
  const user = await requireAuth()
  
  // Admins can edit any deal
  if (user.role === 'ADMIN') return true
  
  // Check if user owns the deal or is assigned to it
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: {
      userId: true,
      assignedToId: true
    }
  })

  if (!deal) return false
  
  return deal.userId === user.id || deal.assignedToId === user.id
}
