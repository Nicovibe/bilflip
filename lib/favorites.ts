'use client';
/**
 * Mock favorites store. Persists user's "starred" cars (by finn-code) to
 * localStorage so the experience survives reloads. When real auth lands, this
 * file's API stays the same — implementation moves server-side.
 *
 * Why a custom event: storage events fire across tabs but NOT in the tab that
 * wrote the change, so we dispatch our own to keep all components in the same
 * tab in sync (e.g. the Sidebar badge updates the moment the detail page
 * stars a car).
 */
import { useEffect, useSyncExternalStore } from 'react';

const KEY = 'bilvipp_favorites';
const EVT = 'bilvipp:favorites-changed';

function readRaw(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeRaw(ids: string[]) {
  if (typeof window === 'undefined') return;
  // Dedupe + stable order (last-touched first looks slightly better than insertion order).
  const unique = Array.from(new Set(ids));
  window.localStorage.setItem(KEY, JSON.stringify(unique));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getFavorites(): string[] {
  return readRaw();
}

export function isFavorite(finn: string): boolean {
  return readRaw().includes(finn);
}

export function addFavorite(finn: string) {
  const cur = readRaw();
  if (cur.includes(finn)) return;
  writeRaw([finn, ...cur]);
}

export function removeFavorite(finn: string) {
  const cur = readRaw();
  if (!cur.includes(finn)) return;
  writeRaw(cur.filter((x) => x !== finn));
}

export function toggleFavorite(finn: string): boolean {
  const cur = readRaw();
  if (cur.includes(finn)) {
    writeRaw(cur.filter((x) => x !== finn));
    return false;
  }
  writeRaw([finn, ...cur]);
  return true;
}

// Stable empty snapshot so useSyncExternalStore doesn't re-render every call
// during SSR (returning a new [] each time is a common trap).
const EMPTY: readonly string[] = Object.freeze([]);

function subscribe(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVT, listener);
  window.addEventListener('storage', listener); // cross-tab sync
  return () => {
    window.removeEventListener(EVT, listener);
    window.removeEventListener('storage', listener);
  };
}

let cachedSnapshot: readonly string[] = EMPTY;
let cachedJson = '';
function getSnapshot(): readonly string[] {
  if (typeof window === 'undefined') return EMPTY;
  const json = window.localStorage.getItem(KEY) || '';
  if (json === cachedJson) return cachedSnapshot;
  cachedJson = json;
  cachedSnapshot = readRaw();
  return cachedSnapshot;
}

/** React hook returning the current favorites + toggle helper. */
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return {
    ids,
    set: new Set(ids),
    has: (finn: string) => ids.includes(finn),
    toggle: toggleFavorite,
  };
}

/** Dispatch the favorites-changed event when the badge in the sidebar mounts,
 * so it syncs even if a different code path called localStorage.setItem. */
export function useFavoritesEffect(cb: () => void) {
  useEffect(() => {
    cb();
    const handler = () => cb();
    window.addEventListener(EVT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [cb]);
}
