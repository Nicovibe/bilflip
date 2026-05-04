'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * Post-Checkout client island.
 *
 * 1. Calls /api/billing/sync to upsert the subscription row from the Stripe
 *    Checkout Session (in case the webhook hasn't fired yet).
 * 2. Calls update() so Auth.js re-runs the JWT callback and the new plan
 *    lands in session.plan / session.status.
 * 3. Redirects to /dashboard once the session reflects the active plan.
 *
 * Important: `update` from useSession() is not a stable reference, so it
 * cannot live in the useEffect dependency array — including it caused an
 * infinite re-fire loop in dev (each successful sync re-rendered the
 * component, producing a fresh `update`, re-running the effect, ...).
 *
 * Solution: a ref guard so the work runs once per mount, and a ref for
 * `update` so we can call the latest version without depending on it.
 */
export function BillingSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const { update } = useSession();
  const updateRef = useRef(update);
  updateRef.current = update;

  const [phase, setPhase] = useState<'syncing' | 'ready' | 'failed'>('syncing');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;
    async function run() {
      try {
        if (sessionId) {
          const res = await fetch(
            `/api/billing/sync?session_id=${encodeURIComponent(sessionId)}`,
          );
          if (!res.ok) throw new Error(`sync ${res.status}`);
        }
        await updateRef.current();
        if (cancelled) return;
        setPhase('ready');
        setTimeout(() => {
          if (!cancelled) router.replace('/dashboard');
        }, 1200);
      } catch (err) {
        console.error('[billing/takk] sync failed', err);
        if (!cancelled) setPhase('failed');
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // Intentionally empty deps — we want this to run exactly once. The
    // sessionId/router/update needed inside `run` are pulled at call time
    // via params/router/updateRef which are all stable for our purposes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="login-card">
      <Link href="/" className="login-brand">
        <span className="brand-mark">b</span>
        <span>
          bil<em style={{ color: 'var(--green)', fontStyle: 'normal' }}>vipp</em>
        </span>
      </Link>
      {phase === 'syncing' && (
        <>
          <h1 className="login-h">Aktiverer abonnement…</h1>
          <p className="login-sub">Et øyeblikk — vi setter opp kontoen din.</p>
        </>
      )}
      {phase === 'ready' && (
        <>
          <h1 className="login-h">Velkommen om bord</h1>
          <p className="login-sub">
            Abonnementet er aktivt. Sender deg til dashboard…
          </p>
        </>
      )}
      {phase === 'failed' && (
        <>
          <h1 className="login-h">Tar litt lengre tid</h1>
          <p className="login-sub">
            Betalingen er mottatt, men aktiveringen henger litt etter. Last
            siden på nytt om noen sekunder, eller{' '}
            <Link href="/dashboard">gå til dashboard</Link>.
          </p>
        </>
      )}
    </div>
  );
}
