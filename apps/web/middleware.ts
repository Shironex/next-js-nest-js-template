import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientEnv } from './env/client'

const API_URL = clientEnv.NEXT_PUBLIC_API_URL

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if this is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get session cookie
  const sessionCookie = request.cookies.get('session')

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If session exists, validate it with the backend
  if (sessionCookie) {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: {
          Cookie: `session=${sessionCookie.value}`,
        },
        credentials: 'include',
      })

      const isAuthenticated = response.ok

      // If on auth route and already authenticated, redirect to dashboard
      if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // If on protected route but session is invalid, redirect to login
      if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        loginUrl.searchParams.set('expired', 'true')

        // Clear invalid session cookie
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('session')
        return response
      }
    } catch (error) {
      // If backend is unreachable and trying to access protected route
      if (isProtectedRoute) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        loginUrl.searchParams.set('error', 'backend_unreachable')
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
