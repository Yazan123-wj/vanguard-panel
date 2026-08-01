/** Lightweight client auth gate for the admin UI (temporary). */

const KEY = 'vanguard-admin-auth';

export function isAdminAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminAuthed(value: boolean) {
  try {
    if (value) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
