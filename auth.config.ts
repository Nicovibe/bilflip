/**
 * Edge-safe Auth.js config. Imported by proxy.ts so the Edge runtime doesn't
 * pull in the Drizzle adapter (which loads pg client code that's heavier
 * than what middleware needs).
 *
 * The full config in auth.ts spreads this object and adds the database
 * adapter + Resend provider. Auth.js docs call this the "split-config"
 * pattern; see https://authjs.dev/guides/edge-compatibility.
 *
 * The JWT and session callbacks live HERE (not in auth.ts) on purpose —
 * they need to run inside the Edge middleware so it can gate routes by
 * subscription tier. The DB read uses neon-http, which is Edge-compatible.
 */
import type { NextAuthConfig } from 'next-auth';

import { isEntitled, type PlanId, type SubStatus } from './lib/plans';
import { getActiveSubscription } from './lib/subscriptions';

export const authConfig = {
  pages: {
    signIn: '/login',
    verifyRequest: '/login?check=email',
    error: '/login?error=1',
  },
  session: { strategy: 'jwt' },
  // Providers list is added in auth.ts (Resend lives there).
  providers: [],
  callbacks: {
    /**
     * JWT callback — always re-reads plan/status from DB on every decode.
     * That fires a Neon HTTP query per gated request, which is acceptable
     * for our scale and avoids the cache-invalidation headache that comes
     * with stale JWTs after Stripe webhook events.
     */
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      if (token.sub) {
        const sub = await getActiveSubscription(token.sub).catch(() => null);
        token.plan = (sub?.plan ?? 'gratis') as PlanId;
        token.status = (sub?.status ?? 'inactive') as SubStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      session.plan = (token.plan ?? 'gratis') as PlanId;
      session.status = (token.status ?? 'inactive') as SubStatus;
      return session;
    },
    /**
     * Runs in middleware on every request to a protected route. Cheap —
     * just reads the freshly-decoded JWT from the callbacks above.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const plan = (auth?.plan ?? 'gratis') as PlanId;
      const status = (auth?.status ?? 'inactive') as SubStatus;
      const entitled = isEntitled(plan, status);

      const path = nextUrl.pathname;

      // Routes that require an active paid subscription. Anonymous and
      // free-tier users get the marketing landing page (/) with a tiny
      // preview, then have to subscribe to access anything else useful.
      const requiresLogin =
        path.startsWith('/markedet') ||
        path.startsWith('/dashboard') ||
        path.startsWith('/bil/') ||
        path.startsWith('/database') ||
        path.startsWith('/varsler');

      const requiresPaid = requiresLogin;

      if (requiresLogin && !isLoggedIn) {
        const next = encodeURIComponent(path + (nextUrl.search || ''));
        return Response.redirect(new URL(`/login?next=${next}`, nextUrl));
      }

      if (requiresPaid && !entitled) {
        return Response.redirect(new URL('/abonnement?paywall=1', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
