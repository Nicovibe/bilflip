import { loadCars, loadFeeds, loadStats } from '@/lib/data';
import { fmt, kr } from '@/lib/format';
import { CarDashboard } from '@/components/CarDashboard';

export const metadata = {
  title: 'Dashboard — bilvipp',
  description: 'Hot deals, review-cases og dealer picks.',
};

export default async function DashboardPage() {
  const [cars, feeds, stats] = await Promise.all([loadCars(), loadFeeds(), loadStats()]);

  // Cars not in any feed list — sorted by deal score
  const seen = new Set<number>();
  feeds.hot.forEach((c) => seen.add(c.id));
  feeds.review.forEach((c) => seen.add(c.id));
  feeds.dealerPicks.forEach((c) => seen.add(c.id));
  const rest = cars.filter((c) => !seen.has(c.id)).sort((a, b) => b.dealScore - a.dealScore);

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ DASHBOARD / FEEDS · {stats.scannedToday} BILER</div>
          <div className="subhead-title">
            Dagens cases — <em>{feeds.hot.length} hot</em>
          </div>
        </div>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <span
            className="mono"
            style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            SNITT MARGIN: {kr(stats.avgMargin)}
          </span>
          <span
            className="mono"
            style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            BESTE: +{kr(stats.bestMargin)}
          </span>
        </div>
      </div>
      <div className="section-tx" style={{ padding: '24px 40px' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="tx-stat-bar" style={{ marginTop: 0 }}>
            <div className="tx-stat">
              <div className="tx-stat-lbl">HOT</div>
              <div className="tx-stat-num up">{feeds.hot.length}</div>
              <div className="tx-stat-delta">Private rene cases</div>
            </div>
            <div className="tx-stat">
              <div className="tx-stat-lbl">REVIEW</div>
              <div className="tx-stat-num">{feeds.review.length}</div>
              <div className="tx-stat-delta">Krever manuell sjekk</div>
            </div>
            <div className="tx-stat">
              <div className="tx-stat-lbl">DEALER PICKS</div>
              <div className="tx-stat-num">{feeds.dealerPicks.length}</div>
              <div className="tx-stat-delta">Sterke unntak</div>
            </div>
            <div className="tx-stat">
              <div className="tx-stat-lbl">TOTAL DATAPUNKTER</div>
              <div className="tx-stat-num">{fmt(stats.totalScanned)}</div>
              <div className="tx-stat-delta">Aktive på finn.no</div>
            </div>
          </div>
        </div>
        <CarDashboard
          hot={feeds.hot}
          review={feeds.review}
          dealerPicks={feeds.dealerPicks}
          rest={rest}
        />
      </div>
    </>
  );
}
