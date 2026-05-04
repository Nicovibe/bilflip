/**
 * POST /api/billing/checkout?plan=pro|trader
 *
 * Creates a Stripe Checkout session for a subscription and 303-redirects the
 * browser to it. Pro gets a 14-day trial; trader is paid-from-day-one (we can
 * change this later — see PLANS.trader.trialDays in lib/plans.ts).
 *
 * Auth: must be logged in. If not, the middleware redirects to /login. We
 * also check here defensively.
 *
 * Customer linking: if the user already has a Stripe customer (subscription
 * row exists), reuse it. Otherwise pass customer_email and let Stripe create
 * one — we read it back from the webhook on checkout.session.completed.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { getSubscription } from '@/lib/subscriptions';
import { PLANS, type PlanId } from '@/lib/plans';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.redirect(new URL('/login?next=/abonnement', req.url));
  }

  const url = new URL(req.url);
  const planParam = url.searchParams.get('plan') as PlanId | null;
  if (!planParam || planParam === 'gratis') {
    return NextResponse.redirect(new URL('/abonnement?error=plan', req.url));
  }
  const plan = PLANS[planParam];
  if (!plan?.stripePriceId) {
    return NextResponse.redirect(new URL('/abonnement?error=price', req.url));
  }

  const existing = await getSubscription(session.user.id);
  const origin = url.origin;

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    customer: existing?.stripeCustomerId ?? undefined,
    customer_email: existing?.stripeCustomerId ? undefined : session.user.email,
    client_reference_id: session.user.id,
    metadata: { userId: session.user.id, plan: plan.id },
    subscription_data: {
      metadata: { userId: session.user.id, plan: plan.id },
      ...(plan.trialDays > 0 && !existing?.stripeSubscriptionId
        ? { trial_period_days: plan.trialDays }
        : {}),
    },
    allow_promotion_codes: true,
    automatic_tax: { enabled: false }, // flip on once Stripe Tax is set up for NO
    success_url: `${origin}/abonnement/takk?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/abonnement?canceled=1`,
  });

  if (!checkout.url) {
    return NextResponse.redirect(new URL('/abonnement?error=stripe', req.url));
  }
  return NextResponse.redirect(checkout.url, { status: 303 });
}
