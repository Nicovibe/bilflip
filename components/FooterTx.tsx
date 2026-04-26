import Link from 'next/link';
import { fmt } from '@/lib/format';

export function FooterTx({ datapoints = 0 }: { datapoints?: number }) {
  return (
    <footer className="footer-tx">
      <div className="footer-tx-grid">
        <div>
          <div className="brand-tx">
            <span className="brand-mark">b</span>
            <span>
              bil<em>vipp</em>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 14, lineHeight: 1.55, maxWidth: '34ch' }}>
            Markedsovervåkning og AI-analyse for nordiske bilflippere. Skannet hver time fra 16 kilder.
          </p>
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              gap: 14,
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.04em',
              flexWrap: 'wrap',
            }}
          >
            <span>SOC 2 · TYPE II</span>
            <span>·</span>
            <span>GDPR</span>
            <span>·</span>
            <span>ORG 928 471 203</span>
          </div>
        </div>
        <div>
          <h4>Produkt</h4>
          <Link href="/markedet">Markedet</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/abonnement">Priser</Link>
          <a aria-disabled style={{ color: 'var(--ink-4)', cursor: 'not-allowed' }}>
            API <span style={{ fontFamily: 'var(--mono)', fontSize: 9, marginLeft: 4 }}>· KOMMER</span>
          </a>
        </div>
        <div>
          <h4>Selskap</h4>
          <Link href="/om">Om oss</Link>
          <Link href="/kontakt">Kontakt</Link>
          <a aria-disabled style={{ color: 'var(--ink-4)', cursor: 'not-allowed' }}>Vilkår</a>
          <a aria-disabled style={{ color: 'var(--ink-4)', cursor: 'not-allowed' }}>Personvern</a>
        </div>
        <div>
          <h4>Status</h4>
          <a>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--green)',
                marginRight: 8,
              }}
            />
            API · Operational
          </a>
          <a>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--green)',
                marginRight: 8,
              }}
            />
            Skanning · Operational
          </a>
          <a>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--gold)',
                marginRight: 8,
              }}
            />
            Telegram · Beta
          </a>
        </div>
      </div>
      <div className="footer-tx-bot">
        <span>© 2026 Bilvipp · Oslo</span>
        <span>UPTIME 99.97% · LATENS 142MS · DATAPUNKTER {fmt(datapoints)}</span>
      </div>
    </footer>
  );
}
