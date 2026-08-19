/** Server-only configuration. None of these may be NEXT_PUBLIC_*. */

export function apiUrl(): string {
  return (
    process.env.API_URL ?? process.env.CMS_API_URL ?? 'http://127.0.0.1:8001'
  ).replace(/\/$/, '');
}

/** The Django admin token. Server-side only — never sent to the browser. */
export function adminApiToken(): string {
  return process.env.ADMIN_API_TOKEN ?? '';
}

export function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? '';
}
