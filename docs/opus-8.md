# Phase 2: Database & Authentication Infrastructure - Complete Implementation

I'll create all the necessary files for Phase 2, implementing a robust authentication system with database integration.

## 1. Database Client Setup

### 📄 `src/lib/db/prisma.ts`

```typescript
/**
 * Prisma Client Singleton
 * Ensures single database connection instance across the application
 * Handles both development (with hot reload) and production environments
 */

import { PrismaClient } from '@prisma/client'

// Extend PrismaClient with middleware and logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  }).$extends({
    // Add soft delete middleware
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // Automatically filter out soft-deleted records
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async findUnique({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
        async count({ args, query }) {
          args.where = { ...args.where, deletedAt: null }
          return query(args)
        },
      },
    },
  }).$extends({
    // Add automatic updated_at handling
    query: {
      $allModels: {
        async update({ args, query }) {
          args.data = { ...args.data, updatedAt: new Date() }
          return query(args)
        },
        async updateMany({ args, query }) {
          args.data = { ...args.data, updatedAt: new Date() }
          return query(args)
        },
      },
    },
  }).$extends({
    // Add model-specific extensions
    model: {
      deal: {
        // Custom method to move deal to next stage
        async moveToNextStage(dealId: string, userId: string) {
          const stageOrder = [
            'NEW_LEADS',
            'INITIAL_CONTACT',
            'NEGOTIATION',
            'CONTRACT_REVIEW',
            'CONTENT_CREATION',
            'REVIEW_APPROVAL',
            'PUBLISHING',
            'PAYMENT_PENDING',
            'COMPLETED'
          ] as const

          const deal = await prisma.deal.findUnique({ where: { id: dealId } })
          if (!deal) throw new Error('Deal not found')

          const currentIndex = stageOrder.indexOf(deal.stage)
          if (currentIndex === stageOrder.length - 1) {
            throw new Error('Deal is already in final stage')
          }

          const nextStage = stageOrder[currentIndex + 1]
          
          // Use transaction to update deal and create history
          return prisma.$transaction(async (tx) => {
            // Create stage history entry
            await tx.dealStageHistory.create({
              data: {
                dealId,
                fromStage: deal.stage,
                toStage: nextStage,
                changedById: userId,
              }
            })

            // Update deal stage
            return tx.deal.update({
              where: { id: dealId },
              data: { 
                stage: nextStage,
                stageUpdatedAt: new Date()
              }
            })
          })
        }
      },
      user: {
        // Custom method to get user with active deals count
        async getWithStats(userId: string) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              _count: {
                select: {
                  ownedDeals: {
                    where: {
                      deletedAt: null,
                      isArchived: false
                    }
                  }
                }
              }
            }
          })

          if (!user) return null

          const dealStats = await prisma.deal.aggregate({
            where: {
              userId,
              deletedAt: null,
              isArchived: false
            },
            _sum: {
              dealValue: true
            },
            _avg: {
              dealValue: true
            }
          })

          return {
            ...user,
            stats: {
              activeDeals: user._count.ownedDeals,
              totalValue: dealStats._sum.dealValue || 0,
              averageValue: dealStats._avg.dealValue || 0
            }
          }
        }
      }
    }
  })
}

// Type for the extended client
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Global store for the Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// Export the prisma client instance
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle database errors
export function handlePrismaError(error: unknown): {
  message: string
  code: string
  statusCode: number
} {
  if (error instanceof Error) {
    // Handle specific Prisma errors
    if ('code' in error) {
      const prismaError = error as any
      switch (prismaError.code) {
        case 'P2002':
          return {
            message: 'A record with this value already exists',
            code: 'DUPLICATE_ENTRY',
            statusCode: 409
          }
        case 'P2025':
          return {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404
          }
        case 'P2003':
          return {
            message: 'Invalid reference to related record',
            code: 'INVALID_REFERENCE',
            statusCode: 400
          }
        default:
          return {
            message: 'Database operation failed',
            code: 'DATABASE_ERROR',
            statusCode: 500
          }
      }
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

// Utility to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectPrisma()
})
```

## 2. Authentication Configuration

### 📄 `src/lib/auth/auth-options.ts`

```typescript
/**
 * NextAuth Configuration Options
 * Centralized auth configuration for consistency across the app
 */

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import type { User } from '@prisma/client'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database sessions
  adapter: PrismaAdapter(prisma) as any,
  
  // Configure session strategy
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Configure JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly'
        }
      }
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],

  // Callback functions
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth account linking
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Link OAuth account to existing user
            const updateData: any = {}
            if (account.provider === 'google') {
              updateData.googleId = profile?.sub || account.providerAccountId
            } else if (account.provider === 'github') {
              updateData.githubId = String(profile?.id || account.providerAccountId)
            }

            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                ...updateData,
                lastLoginAt: new Date()
              }
            })
          } else {
            // Create new user with OAuth info
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                googleId: account.provider === 'google' ? profile?.sub : undefined,
                githubId: account.provider === 'github' ? String(profile?.id) : undefined,
                emailVerified: new Date(),
                lastLoginAt: new Date()
              }
            })
          }
        } catch (error) {
          console.error('Error during sign in:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.user.name
        token.image = session.user.image
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role as string
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/board'
    }
  },

  // Custom pages
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Custom error messages
  events: {
    async signIn({ user }) {
      // Track sign in analytics
      await prisma.activity.create({
        data: {
          userId: user.id!,
          activityType: 'CREATED',
          description: 'User signed in',
          metadata: {
            method: 'oauth',
            timestamp: new Date().toISOString()
          }
        }
      })
    },
    async signOut({ token }) {
      if (token?.id) {
        // Track sign out analytics
        await prisma.activity.create({
          data: {
            userId: token.id as string,
            activityType: 'UPDATED',
            description: 'User signed out',
            metadata: {
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    }
  }
}
```

### 📄 `src/lib/auth/auth.ts`

```typescript
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
```

### 📄 `src/app/api/auth/[...nextauth]/route.ts`

```typescript
/**
 * NextAuth API Route
 * Handles all authentication endpoints
 */

import { handlers } from '@/lib/auth/auth'

// Export NextAuth handlers for the App Router
export const { GET, POST } = handlers
```

## 3. Middleware Implementation

### 📄 `src/middleware.ts`

```typescript
/**
 * Next.js Middleware
 * Handles authentication, redirects, and request processing
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'

// Define route patterns
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/_next',
  '/favicon.ico',
]

const authRoutes = ['/login', '/register', '/forgot-password']
const protectedRoutes = ['/board', '/deals', '/analytics', '/settings']
const apiRoutes = ['/api']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isApiRoute = pathname.startsWith('/api')
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Get session
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Handle API routes
  if (isApiRoute && !pathname.startsWith('/api/auth')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Add user ID to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.user.id)
    requestHeaders.set('x-user-role', session.user.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/board', request.url))
  }

  // Protect dashboard routes
  if (!isAuthenticated && isProtectedRoute) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  // Handle role-based access
  if (isAuthenticated && pathname.startsWith('/admin')) {
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/board', request.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // HSTS for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 4. Database Seed Script

### 📄 `prisma/seed.ts`

```typescript
/**
 * Database Seed Script
 * Populates the database with initial data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sponsorflow.io' },
    update: {},
    create: {
      email: 'admin@sponsorflow.io',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    }
  })

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sponsorflow.io' },
    update: {},
    create: {
      email: 'demo@sponsorflow.io',
      name: 'Demo Creator',
      role: 'CREATOR',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
      youtubeChannelName: 'Demo Channel',
      bio: 'This is a demo account for testing SponsorFlow',
    }
  })

  console.log('✅ Created demo users')

  // Create default tags
  const tagData = [
    { name: 'High Value', color: '#EF4444', description: 'Deals worth over $10,000' },
    { name: 'Recurring', color: '#3B82F6', description: 'Ongoing partnership deals' },
    { name: 'Rush', color: '#F59E0B', description: 'Urgent turnaround required' },
    { name: 'First Time', color: '#10B981', description: 'New sponsor relationship' },
    { name: 'Tech', color: '#8B5CF6', description: 'Technology related sponsors' },
    { name: 'Gaming', color: '#EC4899', description: 'Gaming related sponsors' },
    { name: 'Finance', color: '#14B8A6', description: 'Financial services sponsors' },
    { name: 'Education', color: '#F97316', description: 'Educational content sponsors' },
    { name: 'Lifestyle', color: '#6366F1', description: 'Lifestyle and wellness brands' },
    { name: 'Food & Beverage', color: '#84CC16', description: 'Food and drink sponsors' },
  ]

  for (const tag of tagData) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        ...tag,
        createdById: adminUser.id
      }
    })
  }

  console.log('✅ Created default tags')

  // Create sample sponsors
  const sponsors = [
    {
      name: 'TechFlow Solutions',
      companyName: 'TechFlow Inc.',
      website: 'https://techflow.example.com',
      industry: 'Technology',
      primaryContactName: 'Sarah Johnson',
      primaryContactEmail: 'sarah@techflow.example.com',
      notes: 'Preferred partner for tech reviews',
      typicalBudgetRange: { min: 5000, max: 15000, currency: 'USD' }
    },
    {
      name: 'GameZone Studios',
      companyName: 'GameZone Entertainment',
      website: 'https://gamezone.example.com',
      industry: 'Gaming',
      primaryContactName: 'Mike Chen',
      primaryContactEmail: 'mike@gamezone.example.com',
      notes: 'Focus on gaming peripherals and software',
      typicalBudgetRange: { min: 3000, max: 10000, currency: 'USD' }
    },
    {
      name: 'HealthyLife Nutrition',
      companyName: 'HealthyLife Corp',
      website: 'https://healthylife.example.com',
      industry: 'Health & Wellness',
      primaryContactName: 'Emma Wilson',
      primaryContactEmail: 'emma@healthylife.example.com',
      notes: 'Organic supplements and fitness products',
      typicalBudgetRange: { min: 2000, max: 8000, currency: 'USD' }
    }
  ]

  const createdSponsors = []
  for (const sponsor of sponsors) {
    const created = await prisma.sponsor.create({
      data: {
        ...sponsor,
        createdById: demoUser.id
      }
    })
    createdSponsors.push(created)
  }

  console.log('✅ Created sample sponsors')

  // Create sample deals across different stages
  const dealTemplates = [
    {
      title: 'TechFlow Pro Software Review',
      description: 'In-depth review of TechFlow Pro productivity suite',
      sponsorIndex: 0,
      stage: 'NEW_LEADS' as const,
      dealType: 'DEDICATED_VIDEO' as const,
      dealValue: 12000,
      priority: 'HIGH' as const,
    },
    {
      title: 'GameZone Controller Integration',
      description: 'Showcase new gaming controller in gameplay videos',
      sponsorIndex: 1,
      stage: 'INITIAL_CONTACT' as const,
      dealType: 'INTEGRATION' as const,
      dealValue: 5000,
      priority: 'MEDIUM' as const,
    },
    {
      title: 'HealthyLife 30-Day Challenge',
      description: 'Document 30-day fitness transformation with products',
      sponsorIndex: 2,
      stage: 'NEGOTIATION' as const,
      dealType: 'SERIES_PARTNERSHIP' as const,
      dealValue: 8000,
      priority: 'HIGH' as const,
    },
    {
      title: 'TechFlow Cloud Services',
      description: 'Tutorial series on cloud deployment',
      sponsorIndex: 0,
      stage: 'CONTRACT_REVIEW' as const,
      dealType: 'SERIES_PARTNERSHIP' as const,
      dealValue: 15000,
      priority: 'URGENT' as const,
    },
    {
      title: 'GameZone VR Headset Review',
      description: 'First impressions and setup guide',
      sponsorIndex: 1,
      stage: 'CONTENT_CREATION' as const,
      dealType: 'DEDICATED_VIDEO' as const,
      dealValue: 7500,
      priority: 'HIGH' as const,
    }
  ]

  const tags = await prisma.tag.findMany()
  
  for (const template of dealTemplates) {
    const { sponsorIndex, ...dealData } = template
    
    const deal = await prisma.deal.create({
      data: {
        ...dealData,
        userId: demoUser.id,
        sponsorId: createdSponsors[sponsorIndex].id,
        contentRequirements: 'Standard brand guidelines apply',
        talkingPoints: [
          'Key product features',
          'User benefits',
          'Pricing information',
          'Special offers for viewers'
        ],
        startDate: new Date(),
        contentDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        publishDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      }
    })

    // Add random tags to deals
    const randomTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)
    
    for (const tag of randomTags) {
      await prisma.dealTag.create({
        data: {
          dealId: deal.id,
          tagId: tag.id
        }
      })
    }
  }

  console.log('✅ Created sample deals')

  // Create a deal template
  await prisma.dealTemplate.create({
    data: {
      name: 'Standard Product Review Template',
      description: 'Template for typical product review sponsorships',
      createdById: demoUser.id,
      dealType: 'DEDICATED_VIDEO',
      contentRequirements: 'Minimum 10-minute video with honest review',
      talkingPoints: [
        'Product unboxing',
        'First impressions',
        'Key features demonstration',
        'Pros and cons',
        'Final verdict and recommendations'
      ],
      paymentTerms: 'NET_30',
      isPublic: true,
    }
  })

  console.log('✅ Created deal template')

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      type: 'SYSTEM_ALERT',
      title: 'Welcome to SponsorFlow!',
      message: 'Start managing your YouTube sponsorships efficiently. Check out our getting started guide.',
      actionUrl: '/help/getting-started',
    }
  })

  console.log('✅ Created welcome notification')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 5. TypeScript Declarations

### 📄 `src/types/next-auth.d.ts`

```typescript
/**
 * NextAuth Type Declarations
 * Extends NextAuth types to include custom user properties
 */

import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

## 6. Environment Type Safety

### 📄 `src/types/env.d.ts`

```typescript
/**
 * Environment Variables Type Declarations
 * Provides type safety for process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_APP_NAME: string

    // Database
    DATABASE_URL: string
    DATABASE_URL_NON_POOLING?: string
    SHADOW_DATABASE_URL?: string

    // NextAuth
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // OAuth Providers
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GITHUB_CLIENT_ID?: string
    GITHUB_CLIENT_SECRET?: string

    // Email
    EMAIL_SERVER_HOST: string
    EMAIL_SERVER_PORT: string
    EMAIL_SERVER_USER: string
    EMAIL_SERVER_PASSWORD: string
    EMAIL_FROM: string

    // Optional Services
    SENTRY_DSN?: string
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
    UPLOADTHING_SECRET?: string
    UPLOADTHING_APP_ID?: string
  }
}
```

## Setup Instructions

To complete Phase 2 setup:

1. **Install additional dependencies**:
```bash
npm install bcryptjs @types/bcryptjs
npm install -D tsx
```

2. **Update package.json** with the seed script:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

3. **Run database migrations**:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Seed the database**:
```bash
npm run db:seed
```

5. **Test authentication**:
- Start the dev server: `npm run dev`
- Navigate to `/login`
- Try logging in with: `demo@sponsorflow.io` / `demo123`

This completes Phase 2 with a robust, production-ready authentication system integrated with the database. All files include comprehensive error handling, type safety, and security best practices.
