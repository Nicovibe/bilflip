/**
 * POST /api/billing/webhook  — Stripe webhook receiver.
 *
 * Verifies the Stripe signature on the raw request body, then upserts the
 * user's subscription row. This is the source of truth for plan/status —
 * everything else just reads.
 *
 * IMPORTANT: this route must read the request body raw (req.text()) so the
 * signature can be verified. Don't call req.json() here.
 *
 * Stripe Dashboard → Developers → Webhooks. Endpoint URL:
 *   https://<your-domain>/api/billing/webhook
 * Events to subscribe (minimum):
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *
 * Invoice events (paid / failed) aren't subscribed: customer.subscription.updated
 * fires with the new status whenever payment succeeds or fails, so handling
 * them again here would be redundant.
 */
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { upsertSubscription } from '@/lib/subscriptions';
import type { SubStatus } from '@/lib/plans';

// Edge runtimes lack the Node Buffer/crypto Stripe SDK uses for signature
// verification. Pin to Node.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function tsToDate(ts: number | null | undefined): Date | null {
  return ts ? new Date(ts * 1000) : null;
}

/**
 * Stripe API 2025-09-30+ moved current_period_end from the subscription to
 * each subscription item. We use the first item's window since all items in
 * a single subscription share the same billing cycle.
 */
function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  return tsToDate(sub.items.data[0]?.current_period_end);
}

async function syncSubscription(subscription: Stripe.Subscription, userIdHint?: string) {
  // Resolve userId — prefer subscription metadata, fall back to customer
  // metadata, fall back to caller-provided hint (e.g. checkout.session).
  let userId = subscription.metadata?.userId ?? userIdHint ?? null;
  if (!userId) {
    const customer =
      typeof subscription.customer === 'string'
        ? await stripe.customers.retrieve(subscription.customer)
        : subscription.customer;
    if (customer && !('deleted' in customer)) {
      userId = customer.metadata?.userId ?? null;
    }
  }
  if (!userId) {
    console.error('[stripe webhook] no userId on subscription', subscription.id);
    return;
  }

  const item = subscription.items.data[0];
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: item?.price.id ?? null,
    status: subscription.status as SubStatus,
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
    trialEnd: tsToDate(subscription.trial_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'missing-signature' }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe webhook] signature verify failed', err);
    return NextResponse.json({ error: 'invalid-signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription && s.client_reference_id) {
          const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub, s.client_reference_id);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Ignore everything else.
        break;
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', event.type, err);
    return NextResponse.json({ error: 'handler-failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
