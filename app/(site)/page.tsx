import Link from 'next/link';
import { loadCars, loadFeeds, loadStats } from '@/lib/data';
import { fmt, kr } from '@/lib/format';
import { LiveFeedPanel } from '@/components/LiveFeedPanel';
import { CarTable } from '@/components/CarTable';

export default async function LandingPage() {
  const [cars, feeds, stats] = await Promise.all([loadCars(), loadFeeds(), loadStats()]);

  const liveFeedCars = feeds.hot.length > 0 ? feeds.hot.slice(0, 4) : cars.slice(0, 4);
  const topMovers = [...cars].sort((a, b) => b.margin - a.margin).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <div className="tx-hero">
        <div className="tx-hero-inner">
          <div>
            <div className="tx-eyebrow">
              <span className="dot" />
              LIVE · {stats.scannedToday} BILER SKANNET I DAG
            </div>
            <h1 className="h-display">
              Markedet er <em>ineffektivt.</em>
              <br />
              Vi viser deg hvor.
            </h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Bilvipp skanner finn.no hver time og analyserer hver annonse mot prishistorikk og {stats.totalScanned} sammenlignbare salg. AI-modellen finner biler priset under markedssnitt — og gir deg full kalkyle før du tar telefonen.
            </p>
            <div className="tx-cta-row">
              <Link href="/abonnement" className="btn btn-primary btn-xl">
                Start 14 dager gratis
              </Link>
              <Link href="/markedet" className="btn btn-secondary btn-xl">
                Se markedet i dag →
              </Link>
            </div>
            <div className="tx-fineprint">INGEN BINDING · BETALING VIA VIPPS · AVSLUTT MED ETT KLIKK</div>

            <div className="tx-stat-bar">
              <div className="tx-stat">
                <div className="tx-stat-lbl">SKANNET I DAG</div>
                <div className="tx-stat-num">{fmt(stats.scannedToday)}</div>
                <div className="tx-stat-delta up">▲ {stats.uniqueBrands} merker</div>
              </div>
              <div className="tx-stat">
                <div className="tx-stat-lbl">SNITT MARGIN</div>
                <div className="tx-stat-num">{kr(stats.avgMargin)}</div>
                <div className="tx-stat-delta">Etter alle kostnader</div>
              </div>
              <div className="tx-stat">
                <div className="tx-stat-lbl">BESTE I DAG</div>
                <div className="tx-stat-num up">{kr(stats.bestMargin)}</div>
                <div className="tx-stat-delta">{stats.bestCarTitle.split(' ').slice(0, 3).join(' ')} · {stats.bestCarLocation}</div>
              </div>
              <div className="tx-stat">
                <div className="tx-stat-lbl">DATAPUNKTER</div>
                <div className="tx-stat-num">{fmt(stats.totalScanned)}</div>
                <div className="tx-stat-delta up">Aktive annonser</div>
              </div>
            </div>
          </div>

          <LiveFeedPanel cars={liveFeedCars} />
        </div>
      </div>

      {/* How it works */}
      <div className="section-tx">
        <div className="section-h">
          <div className="left">
            <span className="num">/ 01 / WORKFLOW</span>
            <h2 className="h-1">
              Tre steg fra <em>scan</em> til <em>flip.</em>
            </h2>
          </div>
        </div>
        <div className="howto-grid">
          <div className="howto-card">
            <div className="howto-num">[01] SCAN</div>
            <h3>Markedet skannes hver time</h3>
            <p>
              Vi henter inn hver ny annonse på finn.no, sammenligner mot vår database av {fmt(stats.totalScanned)} biler, og finner avvik mot pris, kilometerstand og modellår.
            </p>
          </div>
          <div className="howto-card">
            <div className="howto-num">[02] ALERT</div>
            <h3>AI-analyse på sekunder</h3>
            <p>
              Hver bil får en deal-score, en estimert markedsverdi (basert på komper) og en konkret anbefaling: kjøp, vurder eller skip. Vi flagger duplikater og skadehistorikk.
            </p>
          </div>
          <div className="howto-card">
            <div className="howto-num">[03] EXECUTE</div>
            <h3>Kjøp, klargjør, selg</h3>
            <p>
              Hver bil kommer med komplett flipping-kalkyle: omregistrering, klargjøring, finanskostnad og forhandlingsrom. Du ser nettofortjenesten før du tar telefonen.
            </p>
          </div>
        </div>
      </div>

      {/* Top movers */}
      <div className="section-tx" style={{ paddingTop: 0 }}>
        <div className="section-h">
          <div className="left">
            <span className="num">/ 02 / TOP MOVERS · I DAG</span>
            <h2 className="h-1">
              Høyest <em>margin</em> akkurat nå
            </h2>
          </div>
          <Link href="/markedet" className="btn btn-secondary">
            Full liste →
          </Link>
        </div>
        <CarTable cars={topMovers} compact />
      </div>

      {/* CTA strip */}
      <div className="section-tx" style={{ paddingTop: 0 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(95,200,143,0.08) 100%)',
            border: '1px solid var(--green)',
            borderRadius: 12,
            padding: '56px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.3,
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(95,200,143,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(95,200,143,0.10) 0%, transparent 40%)',
            }}
            aria-hidden
          />
          <div style={{ position: 'relative' }}>
            <div className="tx-eyebrow" style={{ margin: '0 auto 24px', display: 'inline-flex' }}>
              <span className="dot" />
              14 DAGER GRATIS · INGEN BINDING
            </div>
            <h2 className="h-display" style={{ fontSize: 56 }}>
              Klar for å <em>flippe</em> smartere?
            </h2>
            <p className="lede" style={{ margin: '18px auto 28px' }}>
              Start prøveperioden i dag. 299 kr/mnd etter. Avslutt med ett klikk i appen — vi er aldri vanskelige.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/abonnement" className="btn btn-primary btn-xl">
                Start gratis
              </Link>
              <Link href="/login" className="btn btn-vipps btn-xl">
                Fortsett med Vipps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
