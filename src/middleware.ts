import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * HTTP Basic Auth gate for the whole panel.
 *
 * The in-app /admin/login screen is a client-side placeholder (it accepts any
 * email with a 4+ char password), so it is not a real access control. This
 * middleware is the actual barrier in front of the panel on its public domain.
 * Set PANEL_USER / PANEL_PASSWORD to enable it.
 */
export function middleware(request: NextRequest) {
  const user = process.env.PANEL_USER;
  const password = process.env.PANEL_PASSWORD;

  // No credentials configured — fail closed rather than exposing the panel.
  if (!user || !password) {
    return new NextResponse('Panel access is not configured.', { status: 503 });
  }

  const header = request.headers.get('authorization');

  if (header?.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = '';
    }
    const separator = decoded.indexOf(':');
    if (separator !== -1) {
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);
      if (suppliedUser === user && suppliedPassword === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Vanguard Panel", charset="UTF-8"' },
  });
}

export const config = {
  // Guard every route, including the login screen and static chunks.
  matcher: ['/((?!_next/static/media).*)'],
};
