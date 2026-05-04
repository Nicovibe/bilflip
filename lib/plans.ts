/**
 * Single source of truth for plan tiers and what each one unlocks.
 *
 * Pricing copy (kr/mnd, descriptions) lives in app/(site)/abonnement/page.tsx
 * for now — the numbers there must match what's on the Stripe Dashboard.
 *
 * Stripe Price IDs are loaded from env so dev/prod use different prices
 * without code changes:
 *   STRIPE_PRICE_PRO=price_xxx
 *   STRIPE_PRICE_TRADER=price_yyy
 */
export type PlanId = 'gratis' | 'pro' | 'trader';

export type SubStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

/** Statuses that count as "user has access right now". */
export const ACTIVE_STATUSES: ReadonlySet<SubStatus> = new Set([
  'trialing',
  'active',
  // past_due gives a grace period — Stripe will retry, user keeps access.
  'past_due',
]);

/** Plans considered paid (Pro / Trader). */
export const PAID_PLANS: ReadonlySet<PlanId> = new Set(['pro', 'trader']);

export interface PlanDef {
  id: PlanId;
  label: string;
  /** Monthly price in NOK. 0 for free tier. */
  priceNok: number;
  /** Stripe Price ID. null for the free tier. */
  stripePriceId: string | null;
  /** Days of free trial when user upgrades from gratis. 0 = no trial. */
  trialDays: number;
  features: {
    fullMarkedet: boolean;
    bilDetail: boolean;
    dashboard: boolean;
    database: boolean;
    varsler: boolean;
    apiAccess: boolean;
  };
}

export const PLANS: Record<PlanId, PlanDef> = {
  gratis: {
    id: 'gratis',
    label: 'Gratis',
    priceNok: 0,
    stripePriceId: null,
    trialDays: 0,
    features: {
      fullMarkedet: false,
      bilDetail: false,
      dashboard: false,
      database: false,
      varsler: false,
      apiAccess: false,
    },
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    priceNok: 299,
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? null,
    trialDays: 14,
    features: {
      fullMarkedet: true,
      bilDetail: true,
      dashboard: true,
      database: true,
      varsler: true,
      apiAccess: false,
    },
  },
  trader: {
    id: 'trader',
    label: 'Trader',
    priceNok: 699,
    stripePriceId: process.env.STRIPE_PRICE_TRADER ?? null,
    trialDays: 14,
    features: {
      fullMarkedet: true,
      bilDetail: true,
      dashboard: true,
      database: true,
      varsler: true,
      apiAccess: true,
    },
  },
};

export function planFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return 'gratis';
  if (priceId === PLANS.pro.stripePriceId) return 'pro';
  if (priceId === PLANS.trader.stripePriceId) return 'trader';
  return 'gratis';
}

/** Does a plan/status combo grant access to paid features? */
export function isEntitled(
  plan: PlanId | null | undefined,
  status: SubStatus | null | undefined,
): boolean {
  if (!plan || !status) return false;
  if (!PAID_PLANS.has(plan)) return false;
  return ACTIVE_STATUSES.has(status);
}
