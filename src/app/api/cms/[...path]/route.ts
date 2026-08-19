import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { adminApiToken, apiUrl, sessionSecret } from '@/lib/server-env';
import { SESSION_COOKIE, readSessionToken } from '@/lib/session';

/**
 * Authenticated server-side proxy to the Django admin API.
 *
 * The browser talks only to this route with its session cookie; the
 * X-Admin-Token is attached here and never leaves the server. Request bodies
 * are forwarded as raw bytes so multipart uploads keep their boundaries.
 */
async function handle(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const secret = sessionSecret();
  const token = adminApiToken();

  if (!secret || !token) {
    return NextResponse.json(
      { detail: 'Panel authentication is not configured.' },
      { status: 503 },
    );
  }

  const jar = await cookies();
  const username = await readSessionToken(
    jar.get(SESSION_COOKIE)?.value,
    secret,
  );
  if (!username) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await context.params;
  const segments = (path ?? []).filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  }

  // Django routes all end in a slash; the catch-all drops it.
  const search = new URL(request.url).search;
  const target = `${apiUrl()}/${segments.join('/')}/${search}`;

  const headers = new Headers({ 'X-Admin-Token': token });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const method = request.method.toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : await request.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { detail: 'Could not reach the API.' },
      { status: 502 },
    );
  }

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const payload = await upstream.arrayBuffer();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
