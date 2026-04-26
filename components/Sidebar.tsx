'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { id: string; label: string; icon: string; badge?: string | number; href: string; comingSoon?: boolean };

export function Sidebar({ scannedToday = 0, alertsToday = 0 }: { scannedToday?: number; alertsToday?: number }) {
  const pathname = usePathname() || '/';
  const market: Item[] = [
    { id: 'overview', label: 'Oversikt', icon: '⌂', href: '/' },
    { id: 'inventory', label: 'Markedet', icon: '☰', badge: scannedToday || undefined, href: '/markedet' },
    { id: 'dashboard', label: 'Dashboard', icon: '⊟', href: '/dashboard' },
    { id: 'alerts', label: 'Varsler', icon: '◉', badge: alertsToday || undefined, href: '/varsler', comingSoon: true },
  ];
  const account: Item[] = [
    { id: 'plan', label: 'Plan', icon: '$', href: '/abonnement' },
    { id: 'about', label: 'Om huset', icon: 'i', href: '/om' },
    { id: 'contact', label: 'Kontakt', icon: '✉', href: '/kontakt' },
  ];
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
  return (
    <aside className="sidebar" aria-label="Sidemeny">
      <div className="sidebar-section">
        <div className="sidebar-h">Marked</div>
        {market.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className={`sidebar-item ${isActive(it.href) ? 'active' : ''}`}
            aria-current={isActive(it.href) ? 'page' : undefined}
            title={it.comingSoon ? 'Kommer snart' : undefined}
          >
            <span className="sidebar-icon mono" aria-hidden>
              {it.icon}
            </span>
            <span>{it.label}</span>
            {it.badge !== undefined && <span className="sidebar-badge">{it.badge}</span>}
          </Link>
        ))}
      </div>
      <div className="sidebar-section">
        <div className="sidebar-h">Konto</div>
        {account.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className={`sidebar-item ${isActive(it.href) ? 'active' : ''}`}
            aria-current={isActive(it.href) ? 'page' : undefined}
          >
            <span className="sidebar-icon mono" aria-hidden>
              {it.icon}
            </span>
            <span>{it.label}</span>
          </Link>
        ))}
      </div>
      <div
        style={{
          marginTop: 'auto',
          padding: 14,
          background: 'var(--surface-2)',
          border: '1px solid var(--line)',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--green)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Pro Trial · 14d igjen
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: 10 }}>
          Oppgrader til Trader for full API-tilgang.
        </div>
        <Link
          href="/abonnement"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Oppgrader
        </Link>
      </div>
    </aside>
  );
}
