/**
 * Auth.js v5 root config — call site for the rest of the app.
 *
 * Imports:
 *   import { auth, signIn, signOut, handlers } from '@/auth';
 *
 * - `auth()`       → reads the JWT cookie in server components and route handlers
 * - `signIn()`     → server-action friendly sign-in trigger
 * - `signOut()`    → server-action friendly sign-out trigger
 * - `handlers`     → mounted at app/api/auth/[...nextauth]/route.ts
 *
 * The middleware uses a separate, slimmer config (auth.config.ts) without the
 * Drizzle adapter so the Edge runtime stays small. Both this file and the
 * middleware share the same `callbacks` object — keep the JWT/session/auth
 * logic in auth.config.ts so middleware sees the same plan/status the app
 * does, not a stale snapshot.
 */
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

import { authConfig } from './auth.config';
import { db } from './lib/db';
import { users, accounts, verificationTokens } from './lib/db/schema';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY ?? '',
      from: process.env.AUTH_EMAIL_FROM ?? 'no-reply@bilvipp.no',
    }),
  ],
});
