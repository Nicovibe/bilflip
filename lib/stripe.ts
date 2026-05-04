/**
 * Stripe client — lazily constructed.
 *
 * Why a Proxy: importing this file shouldn't crash if STRIPE_SECRET_KEY is
 * missing or empty. The dev-server boots, /abonnement renders, and only
 * a real Checkout/Portal request triggers the missing-env error. That's a
 * way better surface than "module evaluation failed" before any user code
 * has run.
 *
 * apiVersion is pinned: bump it deliberately when the stripe SDK upgrades,
 * webhook payload shapes can change underneath us otherwise.
 */
import Stripe from 'stripe';

let cached: Stripe | null = null;

function init(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local (see .env.example).',
    );
  }
  cached = new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    appInfo: { name: 'bilvipp', version: '0.2.0' },
  });
  return cached;
}

/**
 * Behaves like the Stripe instance but defers construction to first access.
 * `bind()` on functions ensures `this` is the real Stripe client even when
 * a method is destructured (e.g. const create = stripe.checkout.sessions.create).
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const target = init();
    const value = Reflect.get(target as object, prop, target);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
