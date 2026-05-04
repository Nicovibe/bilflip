/**
 * POST /api/billing/portal
 *
 * Opens the Stripe-hosted Customer Portal where the user manages payment
 * method, downloads invoices, and cancels. We just create a portal session
 * and 303-redirect to it.
 *
 * Auth required. User must already have a Stripe customer (subscription row
 * with stripeCustomerId set) — anyone without one is bounced to /abonnement.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { getSubscription } from '@/lib/subscriptions';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const sub = await getSubscription(session.user.id);
  if (!sub?.stripeCustomerId) {
    return NextResponse.redirect(new URL('/abonnement', req.url));
  }

  const origin = new URL(req.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return NextResponse.redirect(portal.url, { status: 303 });
}
