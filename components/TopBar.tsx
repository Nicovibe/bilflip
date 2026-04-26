'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthed, signOut } from '@/lib/auth';

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

export function TopBar({ scannedToday = 0, alertsToday = 0 }: { scannedToday?: number; alertsToday?: number }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [now, setNow] = useState('--:--');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setAuthed(isAuthed());
  }, [pathname]);

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
          <button
            className="btn btn-secondary"
            onClick={() => {
              signOut();
              setAuthed(false);
              router.push('/');
            }}
          >
            Logg ut
          </button>
        ) : (
          <Link href="/login" className="btn btn-secondary">
            Logg inn
          </Link>
        )}
        <Link href="/abonnement" className="btn btn-primary">
          Start →
        </Link>
      </div>
    </header>
  );
}
