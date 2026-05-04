/**
 * Edge proxy — runs before every request matched by `config.matcher`.
 * (Next.js 16 renamed the file convention from middleware.ts to proxy.ts;
 * the API and exports are unchanged.)
 *
 * Uses the slim auth.config.ts (no DB adapter) so the Edge bundle stays small.
 * The `authorized` callback in that config decides redirects to /login or
 * /abonnement. JWT-based, so this is a cookie read with no DB roundtrip.
 */
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except Next.js internals, static assets, and the auth
  // endpoints themselves (they have their own cookie handling).
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|data/).*)'],
};
