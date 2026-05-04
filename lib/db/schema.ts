/**
 * Postgres schema (Neon) for bilvipp.
 *
 * Tables:
 *  - user / account / verificationToken — Auth.js v5 standard (Drizzle adapter
 *    uses these names by default).
 *  - subscription — one row per user, mirrors Stripe subscription state.
 *  - favorite — server-side favorites (replaces lib/favorites localStorage in
 *    Phase 3).
 *
 * Naming: lower-case singular table names match the @auth/drizzle-adapter
 * default expectations. Keep them as-is unless you also pass custom table
 * references into DrizzleAdapter().
 */
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (a) => [primaryKey({ columns: [a.provider, a.providerAccountId] })],
);

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/**
 * One row per user. Created lazily on first Stripe Checkout. Webhook is the
 * source of truth — never mutate from API routes except via the webhook
 * handler or the post-checkout /api/billing/sync route.
 */
export const subscriptions = pgTable('subscription', {
  userId: text('userId')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripeCustomerId').notNull(),
  stripeSubscriptionId: text('stripeSubscriptionId'),
  stripePriceId: text('stripePriceId'),
  plan: text('plan', { enum: ['gratis', 'pro', 'trader'] })
    .notNull()
    .default('gratis'),
  status: text('status', {
    enum: [
      'inactive',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'paused',
    ],
  })
    .notNull()
    .default('inactive'),
  currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }),
  trialEnd: timestamp('trialEnd', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').default(false).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

export const favorites = pgTable(
  'favorite',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    finnKode: text('finnKode').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (f) => [primaryKey({ columns: [f.userId, f.finnKode] })],
);

export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
