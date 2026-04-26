import Link from 'next/link';
import { fmt, kr } from '@/lib/format';
import type { Car } from '@/lib/mapping';
import { CarImage } from './CarImage';

export function LiveFeedPanel({ cars, lastUpdated }: { cars: Car[]; lastUpdated?: string }) {
  const top = cars.slice(0, 4);
  return (
    <div className="tx-panel">
      <div className="tx-panel-head">
        <div className="left">
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2s infinite',
            }}
            aria-hidden
          />
          LIVE FEED · TOPP 4
        </div>
        <span>{lastUpdated || 'NÅ'}</span>
      </div>
      {top.map((c) => (
        <Link key={c.id} href={`/bil/${c.finnCode}`} className="tx-feed-row">
          <div className="tx-feed-thumb">
            <CarImage src={c.images[0]} alt={c.title} variant="thumb" />
          </div>
          <div>
            <div className="tx-feed-title">{c.title}</div>
            <div className="tx-feed-meta">
              {c.year} · {fmt(c.km)}KM · ◉ {c.location}
            </div>
          </div>
          <div>
            <div className="tx-feed-margin">+{kr(c.margin)}</div>
            <div className="tx-feed-score">SCORE {c.dealScore}</div>
          </div>
        </Link>
      ))}
      {top.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
          Ingen biler i feed enda.
        </div>
      )}
      <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid var(--line)' }}>
        <Link
          href="/markedet"
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--green)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          SE ALLE {cars.length} →
        </Link>
      </div>
    </div>
  );
}
