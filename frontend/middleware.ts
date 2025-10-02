import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the user is trying to access protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  // Check if the user is trying to access auth routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  // Get the token from cookies or localStorage (we'll use cookies for SSR)
  const token = request.cookies.get('access_token')?.value;
  
  // If accessing protected routes without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing auth routes with token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
