/**
 * Client-side session helpers.
 *
 * Access control lives in middleware + the /api/cms proxy, both of which
 * validate the httpOnly session cookie. The browser cannot read that cookie,
 * so there is nothing to check here — only a way to end the session.
 */

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    /* clearing the cookie server-side is best effort */
  }
}
