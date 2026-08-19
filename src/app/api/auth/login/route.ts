import { NextResponse } from 'next/server';

import { adminApiToken, apiUrl, sessionSecret } from '@/lib/server-env';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
} from '@/lib/session';

/**
 * Exchanges Django staff credentials for a signed session cookie.
 * The API token stays on the server; the browser only ever gets the cookie.
 */
export async function POST(request: Request) {
  const secret = sessionSecret();
  const token = adminApiToken();

  if (!secret || !token) {
    return NextResponse.json(
      { detail: 'Panel authentication is not configured.' },
      { status: 503 },
    );
  }

  let username = '';
  let password = '';
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    username = (body.username ?? '').trim();
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ detail: 'Invalid request.' }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json(
      { detail: 'Enter your username and password.' },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl()}/api/admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { detail: 'Could not reach the API.' },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    // Don't leak whether the username or the password was wrong.
    return NextResponse.json(
      { detail: 'Invalid username or password.' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(username, secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
