'use client';
import { useMemo, useState } from 'react';
import type { Car } from '@/lib/mapping';
import { CarTable } from './CarTable';

type Section = { label: string; tone: 'g' | 'a' | 'b' | 'n'; cars: Car[] };

const BRAND_FILTERS = ['Alle', 'Tesla', 'Toyota', 'Volkswagen', 'BMW', 'Audi', 'Volvo', 'Hyundai', 'Kia', 'Polestar', 'Ford', 'Skoda', 'Nissan'];

const dotColor: Record<Section['tone'], string> = {
  g: 'var(--green)',
  a: 'var(--gold)',
  b: 'var(--blue)',
  n: 'var(--ink-3)',
};

export function CarDashboard({
  hot,
  review,
  dealerPicks,
  rest,
}: {
  hot: Car[];
  review: Car[];
  dealerPicks: Car[];
  rest: Car[];
}) {
  const [filter, setFilter] = useState('Alle');
  const [q, setQ] = useState('');

  const allCars = useMemo(() => [...hot, ...review, ...dealerPicks, ...rest], [hot, review, dealerPicks, rest]);
  const isFiltering = filter !== 'Alle' || q.length > 0;

  const flat = useMemo(() => {
    let list = allCars;
    if (filter !== 'Alle') {
      const f = filter.toLowerCase();
      list = list.filter((c) => c.brand.toLowerCase() === f);
    }
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(qq) ||
          c.location.toLowerCase().includes(qq) ||
          c.finnCode.includes(qq),
      );
    }
    return list;
  }, [allCars, filter, q]);

  const sections: Section[] = [
    { label: 'Hot — rene private cases med dokumentert margin', tone: 'g', cars: hot },
    { label: 'Review — non-dealer som krever manuell sjekk', tone: 'a', cars: review },
    { label: 'Dealer picks — sterke unntak fra forhandler', tone: 'b', cars: dealerPicks },
    { label: 'Alle øvrige biler — sortert etter deal-score', tone: 'n', cars: rest },
  ];

  return (
    <>
      <div className="tx-toolbar">
        {BRAND_FILTERS.map((b) => (
          <button key={b} className={`tx-chip ${filter === b ? 'active' : ''}`} onClick={() => setFilter(b)}>
            {b}
          </button>
        ))}
        <div className="tx-search">
          <span style={{ color: 'var(--ink-3)' }} aria-hidden>⌕</span>
          <input
            placeholder="Søk modell, by, finn-kode..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Søk"
          />
        </div>
      </div>

      {isFiltering ? (
        <CarTable cars={flat} />
      ) : (
        <div>
          {sections.map((s) =>
            s.cars.length > 0 ? (
              <div key={s.label}>
                <div className="feed-section-h">
                  <span className="dot" style={{ background: dotColor[s.tone] }} />
                  {s.label}
                  <span className="count">({s.cars.length})</span>
                </div>
                <CarTable cars={s.cars} />
              </div>
            ) : null,
          )}
          {sections.every((s) => s.cars.length === 0) && (
            <div className="empty-state">Ingen biler å vise — vent på neste skanning.</div>
          )}
        </div>
      )}
    </>
  );
}
