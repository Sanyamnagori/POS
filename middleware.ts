import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/backend/database/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const isPublicPath = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/s/') || // Customer specific routes
    pathname.startsWith('/api/auth');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check JWT cookie
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to login if no token is found for private routes
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  try {
    const payload = await verifyToken(token);
    if (!payload) {
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
