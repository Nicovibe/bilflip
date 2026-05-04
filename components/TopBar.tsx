'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { isEntitled, type PlanId } from '@/lib/plans';

const links = [
  { id: '/', label: 'Home' },
  { id: '/markedet', label: 'Markedet' },
  { id: '/abonnement', label: 'Plans' },
  { id: '/om', label: 'Om' },
  { id: '/kontakt', label: 'Kontakt' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

const PLAN_LABEL: Record<PlanId, string> = {
  gratis: 'GRATIS',
  pro: 'PRO',
  trader: 'TRADER',
};

export function TopBar({ scannedToday = 0, alertsToday = 0 }: { scannedToday?: number; alertsToday?: number }) {
  const pathname = usePathname() || '/';
  const { data: session, status } = useSession();
  const authed = status === 'authenticated';
  const plan = (session?.plan ?? 'gratis') as PlanId;
  const paid = authed && isEntitled(plan, session?.status);
  const email = session?.user?.email ?? '';

  const [now, setNow] = useState('--:--');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <Link href="/" className="brand-tx" aria-label="Til forsiden">
        <span className="brand-mark">b</span>
        <span>
          bil<em>vipp</em>
        </span>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--ink-3)',
            marginLeft: 6,
            letterSpacing: '0.06em',
          }}
        >
          v2.0
        </span>
      </Link>
      <nav className="tx-nav" aria-label="Hovednavigasjon">
        {links.map((l) => (
          <Link
            key={l.id}
            href={l.id}
            className={`tx-nav-item ${isActive(pathname, l.id) ? 'active' : ''}`}
            aria-current={isActive(pathname, l.id) ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="tx-status" role="status" aria-label="System status: live">
        <span>
          <span className="dot" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />
          <span className="live-text">LIVE · {now}</span>
        </span>
        <span className="live-text">
          {scannedToday} SCANS · {alertsToday} ALERTS
        </span>

        {authed ? (
          <>
            {/* Compact user chip — email + plan badge in one mono pill */}
            <span
              title={email}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                border: '1px solid var(--line)',
                color: 'var(--ink-2)',
                maxWidth: 240,
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textTransform: 'lowercase',
                }}
              >
                {email}
              </span>
              <span
                style={{
                  color: paid ? 'var(--green)' : 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                · {PLAN_LABEL[plan]}
              </span>
            </span>

            {paid && (
              <Link href="/dashboard" className="btn btn-secondary">
                Dashboard
              </Link>
            )}
            {paid ? (
              // Submitting this form hits /api/billing/portal which 303s to
              // Stripe Customer Portal. Native form post avoids needing JS.
              <form method="post" action="/api/billing/portal" style={{ display: 'inline' }}>
                <button type="submit" className="btn btn-secondary">
                  Administrer
                </button>
              </form>
            ) : (
              <Link href="/abonnement" className="btn btn-primary">
                Oppgrader →
              </Link>
            )}
            <button className="btn btn-secondary" onClick={() => signOut({ callbackUrl: '/' })}>
              Logg ut
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-secondary">
              Logg inn
            </Link>
            <Link href="/abonnement" className="btn btn-primary">
              Start →
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
