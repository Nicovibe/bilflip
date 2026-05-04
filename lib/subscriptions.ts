/**
 * Subscription read/write helpers.
 *
 * Reads — used by Auth.js JWT callback to stamp plan into the session, and by
 * server components / API routes that need to gate features.
 *
 * Writes — only the Stripe webhook (and the post-checkout sync route) should
 * upsert subscription rows. Everything else just reads.
 */
import { eq } from 'drizzle-orm';
import { db } from './db';
import { subscriptions, type Subscription } from './db/schema';
import {
  type PlanId,
  type SubStatus,
  isEntitled,
  planFromPriceId,
} from './plans';

export async function getSubscription(
  userId: string,
): Promise<Subscription | null> {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** Lightweight projection used by Auth.js callbacks — only what we put in JWT. */
export async function getActiveSubscription(userId: string): Promise<{
  plan: PlanId;
  status: SubStatus;
} | null> {
  const sub = await getSubscription(userId);
  if (!sub) return null;
  return { plan: sub.plan, status: sub.status };
}

export interface UpsertSubscriptionInput {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: SubStatus;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export async function upsertSubscription(input: UpsertSubscriptionInput) {
  const plan = planFromPriceId(input.stripePriceId);
  const row = {
    ...input,
    plan,
    updatedAt: new Date(),
  };
  await db
    .insert(subscriptions)
    .values(row)
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: row.stripeCustomerId,
        stripeSubscriptionId: row.stripeSubscriptionId,
        stripePriceId: row.stripePriceId,
        plan: row.plan,
        status: row.status,
        currentPeriodEnd: row.currentPeriodEnd,
        trialEnd: row.trialEnd,
        cancelAtPeriodEnd: row.cancelAtPeriodEnd,
        updatedAt: row.updatedAt,
      },
    });
  return row;
}

export { isEntitled };
