import Link from 'next/link';
import { loadStats } from '@/lib/data';
import { fmt } from '@/lib/format';
import { BigMap } from '@/components/BigMap';

export const metadata = {
  title: 'Om bilvipp — Oslo',
  description: 'Vi bygger verktøyet vi selv ville betalt for.',
};

export default async function OmPage() {
  const stats = await loadStats();
  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ OM HUSET / OSLO</div>
          <div className="subhead-title">
            Bygget av <em>flippere</em>, for flippere.
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          EST. 2026 · ORG 928 471 203
        </span>
      </div>
      <div className="section-tx">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 48,
            alignItems: 'start',
            marginBottom: 48,
          }}
        >
          <div>
            <p className="lede" style={{ fontSize: 18 }}>
              Vi startet bilvipp etter å ha kjøpt og solgt biler privat — og innsett at hele markedsovervåkningen kunne automatiseres. I dag er vi i full utvikling, med {fmt(stats.totalScanned)} aktive annonser i datasettet.
            </p>
            <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 18, lineHeight: 1.65 }}>
              Bilvipp er et lite team i Oslo. Vi tjener ikke penger på transaksjonene dine. Vi tar ikke provisjon. Vi er aldri part i handelen. Det vi gjør er å bygge verktøyet vi selv ville betalt for.
            </p>
            <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 14, lineHeight: 1.65 }}>
              Hver bil får en deal-score, en estimert markedsverdi, og konkrete anbefalinger basert på sammenlignbare salg. Vi flagger duplikater, varsler ved prisfall, og lar deg fokusere på det viktigste — å lukke en god handel.
            </p>
          </div>
          <div className="tx-card">
            <div className="tx-card-h">
              <h4>NØKKELTALL · I DAG</h4>
              <span className="badge-on">VERIFISERT</span>
            </div>
            {[
              ['Aktive annonser', fmt(stats.totalScanned)],
              ['Skannet i dag', fmt(stats.scannedToday)],
              ['Snitt margin', `${fmt(stats.avgMargin)} kr`],
              ['Beste i dag', `${fmt(stats.bestMargin)} kr`],
              ['Unike merker', String(stats.uniqueBrands)],
              ['Skanninger per døgn', '24'],
            ].map(([k, v]) => (
              <div key={k} className="kv-row">
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-h" style={{ marginTop: 56 }}>
          <div className="left">
            <span className="num">/ HQ / OSLO</span>
            <h2 className="h-1">Karenslyst Allé 53</h2>
          </div>
          <Link href="/kontakt" className="btn btn-secondary">
            Bestill besøk →
          </Link>
        </div>

        <BigMap />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
          <div className="tx-card">
            <div className="tx-card-h">
              <h4>ADRESSE</h4>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55 }}>
              Karenslyst Allé 53
              <br />
              0279 Oslo, Norge
            </p>
            <div
              style={{
                marginTop: 10,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
                letterSpacing: '0.06em',
              }}
            >
              59.9168°N · 10.6850°E
            </div>
          </div>
          <div className="tx-card">
            <div className="tx-card-h">
              <h4>ÅPNINGSTIDER</h4>
            </div>
            <div className="kv-row">
              <span className="k">Man–Fre</span>
              <span className="v">09–17</span>
            </div>
            <div className="kv-row">
              <span className="k">Lørdag</span>
              <span className="v">Etter avtale</span>
            </div>
            <div className="kv-row">
              <span className="k">Søndag</span>
              <span className="v">Stengt</span>
            </div>
          </div>
          <div className="tx-card">
            <div className="tx-card-h">
              <h4>KOLLEKTIV</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Skøyen T-bane (3 min)
              <br />
              Buss 21, 31 til Skøyen
              <br />
              Gjesteparkering bak bygget
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
