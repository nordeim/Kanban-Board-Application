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
