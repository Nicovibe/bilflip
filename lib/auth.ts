/**
 * Server-side auth helpers. Use these in server components, route handlers
 * and server actions to enforce login / paid-tier guards. They throw via
 * `redirect()` so the call site doesn't need branching.
 *
 * For client components, import from 'next-auth/react' directly:
 *   import { useSession, signIn, signOut } from 'next-auth/react';
 */
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isEntitled } from '@/lib/plans';

/** Asserts a logged-in user. Redirects to /login otherwise. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session;
}

/** Asserts logged-in + paid (Pro or Trader). Redirects to /abonnement otherwise. */
export async function requirePaid() {
  const session = await requireUser();
  if (!isEntitled(session.plan, session.status)) {
    redirect('/abonnement?paywall=1');
  }
  return session;
}

/** Returns the session if any, else null. Doesn't redirect. */
export async function getSession() {
  return auth();
}
