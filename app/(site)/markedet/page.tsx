import { loadCars, loadStats } from '@/lib/data';
import { CarTableExplorer } from '@/components/CarTable';
import Link from 'next/link';

export const metadata = {
  title: 'Markedet — bilvipp',
  description: 'Alle biler på markedet i dag, sortert etter margin.',
};

export default async function MarkedetPage() {
  const [cars, stats] = await Promise.all([loadCars(), loadStats()]);
  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ MARKEDET / DAGENS SKAN</div>
          <div className="subhead-title">
            Dagens marked — <em>{cars.length} biler</em>
          </div>
        </div>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <span
            className="mono"
            style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            NESTE SKAN: ~60 min
          </span>
          <Link href="/dashboard" className="btn btn-secondary">
            Til dashboard →
          </Link>
          <Link href="/abonnement" className="btn btn-primary">
            + Sett alert
          </Link>
        </div>
      </div>
      <div className="section-tx" style={{ padding: '24px 40px' }}>
        <CarTableExplorer cars={cars} />
        <p style={{ marginTop: 22, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {cars.length} aktive · {stats.uniqueBrands} merker · oppdateres hver time
        </p>
      </div>
    </>
  );
}
