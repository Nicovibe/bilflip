import { Suspense } from 'react';
import { requireUser } from '@/lib/auth';
import { BillingSuccess } from './client';

export const metadata = {
  title: 'Velkommen — bilvipp',
};

/**
 * Stripe Checkout success landing.
 *
 * Server-side: just enforces login (no session = bounce). The actual sync
 * call + JWT refresh + redirect to dashboard happens in the client island
 * so we can call useSession().update() once the subscription row is written.
 */
export default async function TakkPage() {
  await requireUser();
  return (
    <div className="login-shell">
      <Suspense fallback={null}>
        <BillingSuccess />
      </Suspense>
    </div>
  );
}
