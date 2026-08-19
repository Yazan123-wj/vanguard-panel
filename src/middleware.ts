import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE, readSessionToken } from '@/lib/session';

/**
 * Route guard for the panel.
 *
 * Unauthenticated visitors are redirected to the panel's own /admin/login
 * screen — no browser Basic Auth dialog. Real credential checking happens in
 * /api/auth/login against Django; this only validates the signed cookie.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login screen and the auth endpoints must stay reachable.
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET ?? '';
  const username = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    secret,
  );

  if (username) return NextResponse.next();

  // API calls get a status they can handle; page loads get sent to the login.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  if (pathname !== '/' && pathname !== '/admin') {
    loginUrl.searchParams.set('next', `${pathname}${search}`);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Match only the protected surface. A broad negative-lookahead pattern also
  // caught /brand/* and the image optimizer, which broke the logo on the
  // (unauthenticated) login page.
  matcher: ['/', '/admin/:path*', '/api/cms/:path*'],
};
