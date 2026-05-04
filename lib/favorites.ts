'use client';
/**
 * Favorites store. Hybrid:
 *
 *   - Anonymous / unauthenticated  → localStorage (so a visitor on the
 *     marketing landing can star cars without an account; data is transient).
 *   - Authenticated                 → /api/favorites (Postgres-backed).
 *
 * On the *first* authenticated render in a browser that still has localStorage
 * favorites, we POST them to /api/favorites/import (idempotent), set a
 * `bilvipp_favorites_migrated_at` flag, and clear the localStorage list.
 * Migration is one-shot per browser; logging out doesn't undo it.
 *
 * The `useFavorites()` hook signature is unchanged from the localStorage-only
 * version — `{ ids, set, has, toggle }`. Call sites don't need updates.
 *
 * Optimistic writes: toggle/add/remove updates the local cache immediately and
 * fires the network request in the background. If the request fails we log
 * but don't revert — best UX trade-off for a non-critical feature.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';

const LS_KEY = 'bilvipp_favorites';
const LS_MIGRATED_KEY = 'bilvipp_favorites_migrated_at';
const EVT = 'bilvipp:favorites-changed';

type Mode = 'localStorage' | 'server';

// ---- module-scope state (shared across all hook subscribers) ----
let cache: string[] = [];
let mode: Mode = 'localStorage';
let inflightHydrate: Promise<void> | null = null;
let lastHydratedAt = 0;
const HYDRATE_TTL_MS = 60_000; // dedupe re-mounts within 1 min

function readLocalStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    /* ignore quota errors */
  }
}

function emit() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVT));
}

function setCache(ids: string[]) {
  cache = Array.from(new Set(ids));
  emit();
}

// ---- server sync ----

async function hydrateFromServer(force = false): Promise<void> {
  if (inflightHydrate) return inflightHydrate;
  if (!force && Date.now() - lastHydratedAt < HYDRATE_TTL_MS) return;
  inflightHydrate = (async () => {
    try {
      const res = await fetch('/api/favorites', { cache: 'no-store' });
      if (!res.ok) throw new Error(`favorites GET ${res.status}`);
      const ids = (await res.json()) as string[];
      setCache(ids);
      lastHydratedAt = Date.now();
    } catch (err) {
      console.warn('[favorites] hydrate failed', err);
    } finally {
      inflightHydrate = null;
    }
  })();
  return inflightHydrate;
}

async function migrateLocalStorageOnce(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.localStorage.getItem(LS_MIGRATED_KEY)) return false;
  const local = readLocalStorage();
  if (local.length === 0) {
    // Nothing to migrate; just stamp the flag so we don't retry next time.
    window.localStorage.setItem(LS_MIGRATED_KEY, String(Date.now()));
    window.localStorage.removeItem(LS_KEY);
    return false;
  }
  try {
    const res = await fetch('/api/favorites/import', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ finnKodes: local }),
    });
    if (!res.ok) throw new Error(`import ${res.status}`);
    window.localStorage.setItem(LS_MIGRATED_KEY, String(Date.now()));
    window.localStorage.removeItem(LS_KEY);
    return true;
  } catch (err) {
    console.warn('[favorites] migrate failed (will retry next session)', err);
    return false;
  }
}

// ---- imperative API (kept for back-compat; hook is the preferred entry) ----

export function getFavorites(): string[] {
  if (mode === 'localStorage') cache = readLocalStorage();
  return cache;
}

export function isFavorite(finn: string): boolean {
  return getFavorites().includes(finn);
}

export function addFavorite(finn: string) {
  if (cache.includes(finn)) return;
  setCache([finn, ...cache]);
  if (mode === 'localStorage') {
    writeLocalStorage(cache);
  } else {
    void fetch('/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ finnKode: finn }),
    }).catch((err) => console.warn('[favorites] POST failed', err));
  }
}

export function removeFavorite(finn: string) {
  if (!cache.includes(finn)) return;
  setCache(cache.filter((x) => x !== finn));
  if (mode === 'localStorage') {
    writeLocalStorage(cache);
  } else {
    void fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ finnKode: finn }),
    }).catch((err) => console.warn('[favorites] DELETE failed', err));
  }
}

export function toggleFavorite(finn: string): boolean {
  if (cache.includes(finn)) {
    removeFavorite(finn);
    return false;
  }
  addFavorite(finn);
  return true;
}

// ---- React glue ----

const EMPTY: readonly string[] = Object.freeze([]);

function subscribe(listener: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVT, listener);
    window.removeEventListener('storage', listener);
  };
}

let snapshotCache: readonly string[] = EMPTY;
let snapshotKey = '';

function getSnapshot(): readonly string[] {
  if (typeof window === 'undefined') return EMPTY;
  if (mode === 'localStorage') {
    const raw = window.localStorage.getItem(LS_KEY) || '';
    if (raw === snapshotKey) return snapshotCache;
    snapshotKey = raw;
    snapshotCache = readLocalStorage();
    cache = snapshotCache.slice();
    return snapshotCache;
  }
  // server mode — `cache` is the source of truth, updated by setCache()
  const key = cache.join(',');
  if (key === snapshotKey) return snapshotCache;
  snapshotKey = key;
  snapshotCache = cache.slice();
  return snapshotCache;
}

export function useFavorites() {
  const { status } = useSession();

  // Mode switching + server hydration. The async chain runs once per
  // status transition; the dedupe in hydrateFromServer keeps re-mounts cheap.
  useEffect(() => {
    if (status === 'authenticated') {
      mode = 'server';
      (async () => {
        await hydrateFromServer();
        const migrated = await migrateLocalStorageOnce();
        if (migrated) {
          // Migration changed the server state — pull again to merge.
          await hydrateFromServer(true);
        }
      })();
    } else if (status === 'unauthenticated') {
      mode = 'localStorage';
      lastHydratedAt = 0;
      cache = readLocalStorage();
      emit();
    }
  }, [status]);

  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return {
    ids,
    set: new Set(ids),
    has: (finn: string) => ids.includes(finn),
    toggle: toggleFavorite,
  };
}

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
