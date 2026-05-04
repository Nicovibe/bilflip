/**
 * GET /api/billing/sync?session_id=cs_xxx
 *
 * Defensive companion to the webhook. Called from the post-checkout success
 * page so the user's plan flips to active without waiting for the webhook
 * (Stripe redirects can arrive before the webhook fires). Idempotent — safe
 * to call from both paths.
 *
 * Returns { ok: true, plan, status } so the success page can show feedback
 * and trigger a session.update() to refresh the JWT.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { upsertSubscription } from '@/lib/subscriptions';
import type { SubStatus } from '@/lib/plans';

export const runtime = 'nodejs';

function tsToDate(ts: number | null | undefined): Date | null {
  return ts ? new Date(ts * 1000) : null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'missing-session-id' }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  // Defense: only sync if the checkout actually belongs to this user.
  if (checkoutSession.client_reference_id !== session.user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const sub = checkoutSession.subscription;
  if (!sub || typeof sub === 'string') {
    return NextResponse.json({ ok: false, reason: 'no-subscription-yet' });
  }

  const item = sub.items.data[0];
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const result = await upsertSubscription({
    userId: session.user.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    stripePriceId: item?.price.id ?? null,
    status: sub.status as SubStatus,
    // Stripe API 2025-09-30+: current_period_end is per-item.
    currentPeriodEnd: tsToDate(item?.current_period_end),
    trialEnd: tsToDate(sub.trial_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
  });

  return NextResponse.json({ ok: true, plan: result.plan, status: result.status });
}
