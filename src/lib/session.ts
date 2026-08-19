/**
 * Signed session cookie for the panel.
 *
 * Uses Web Crypto (HMAC-SHA256) so the same helpers run in edge middleware and
 * in node route handlers. The cookie carries only the username and an expiry,
 * both covered by the signature — there is no server-side session store.
 */

export const SESSION_COOKIE = 'vanguard_panel_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time compare so signature checks don't leak byte positions. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(
  username: string,
  secret: string,
): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${username}:${expiresAt}`;
  return `${btoa(payload)}.${await sign(payload, secret)}`;
}

/** Returns the username for a valid, unexpired token, otherwise null. */
export async function readSessionToken(
  token: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!token || !secret) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;

  const encodedPayload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let payload: string;
  try {
    payload = atob(encodedPayload);
  } catch {
    return null;
  }

  if (!safeEqual(signature, await sign(payload, secret))) return null;

  const split = payload.lastIndexOf(':');
  if (split < 1) return null;
  const expiresAt = Number(payload.slice(split + 1));
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return payload.slice(0, split);
}
