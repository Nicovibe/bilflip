'use client';
/**
 * Wraps the app with Auth.js's SessionProvider so client components can call
 * `useSession()` without each one having to fetch /api/auth/session itself.
 *
 * Mounted once in app/layout.tsx around {children}. Server components and
 * route handlers still use the server `auth()` helper from @/auth — this
 * provider is purely a client-side cache.
 *
 * <FavoritesSync> is a sibling that mounts the favorites hook globally so
 * the localStorage→server migration runs on any page a logged-in user
 * lands on — not just pages that happen to render a FavoriteButton.
 */
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { FavoritesSync } from '@/components/FavoritesSync';

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <FavoritesSync />
      {children}
    </SessionProvider>
  );
}
