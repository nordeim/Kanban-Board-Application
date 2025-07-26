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
