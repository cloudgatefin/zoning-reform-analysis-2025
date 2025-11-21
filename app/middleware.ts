import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const response = NextResponse.next();

  // Add performance timing headers
  response.headers.set('X-Request-Start', start.toString());

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add caching headers for static assets
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/_next/static/')) {
    // Cache static assets for 1 year
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/')) {
    // API routes - vary by endpoint
    if (pathname.includes('/analytics/')) {
      // Analytics endpoints - no cache
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else if (pathname.includes('/reforms/metrics') || pathname.includes('/states/baseline')) {
      // Static data - cache for 1 hour
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    } else {
      // Other API routes - cache for 5 minutes
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    }
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    // Images - cache for 1 week
    response.headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  } else {
    // HTML pages - cache for 1 minute with revalidation
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except for Next.js internals
    '/((?!_next/image|favicon.ico).*)',
  ],
};
