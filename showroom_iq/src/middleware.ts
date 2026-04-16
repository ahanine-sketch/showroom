import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // 1. Define protected prefixes
  const isProtectedPath = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/owner') || 
    pathname.startsWith('/commercial');

  // 2. Redirect to login if accessing protected path without token
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Basic Role Protection (Optional but safer)
  // We can decode the JWT payload to check if the role matches the folder
  if (isProtectedPath && token) {
    try {
      // Decode JWT payload (standard across Edge/Node)
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      const userRole = payload.role;

      // Check for role mismatch and redirect if needed
      if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/owner') && userRole !== 'OWNER') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Note: Admin and Owner can sometimes access commercial routes, 
      // but for strictness we match it to the directory.
      if (pathname.startsWith('/commercial') && userRole === 'GUEST') {
         return NextResponse.redirect(new URL('/', request.url));
      }

    } catch (e) {
      // If token is malformed, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Ensure middleware only runs on matching routes for performance
export const config = {
  matcher: [
    '/admin/:path*',
    '/owner/:path*',
    '/commercial/:path*',
  ],
};
