/**
 * Mock client-side auth — localStorage-only.
 *
 * Replace with real auth (Auth.js + Vipps Login) when ready. The API surface
 * (`isAuthed`, `signIn`, `signOut`) should stay stable so callers don't change.
 */

const KEY = 'bilvipp_auth';

export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function signIn(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

export function signOut(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
