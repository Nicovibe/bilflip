'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmt, kr } from '@/lib/format';
import type { Car } from '@/lib/mapping';
import { CarImage } from './CarImage';
import { MiniSpark } from './MiniSpark';

type Props = {
  cars: Car[];
  compact?: boolean;
  showSpark?: boolean;
};

const BRAND_OPTIONS = ['Alle', 'Tesla', 'Volkswagen', 'BMW', 'Audi', 'Toyota', 'Volvo', 'Hyundai', 'Kia', 'Polestar', 'Ford', 'Skoda', 'Nissan', 'Mercedes'];

export function CarTable({ cars, compact = false, showSpark = true }: Props) {
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th style={{ width: 38 }}>#</th>
            <th>Bil</th>
            <th className="r">Pris</th>
            <th className="r">Markedssnitt</th>
            <th className="r">Margin</th>
            {showSpark && !compact && <th className="r">90d</th>}
            <th className="r">Score</th>
            <th>Lokasjon</th>
            {!compact && <th>Listet</th>}
          </tr>
        </thead>
        <tbody>
          {cars.map((c, i) => (
            <CarRow key={c.id} car={c} index={i} compact={compact} showSpark={showSpark} />
          ))}
        </tbody>
      </table>
      {cars.length === 0 && (
        <div className="empty-state" style={{ marginTop: 16 }}>Ingen biler matcher filteret.</div>
      )}
    </div>
  );
}

function CarRow({ car, index, compact, showSpark }: { car: Car; index: number; compact: boolean; showSpark: boolean }) {
  const router = useRouter();
  const onClick = () => router.push(`/bil/${car.finnCode}`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  const scoreCls = car.dealScore >= 75 ? '' : car.dealScore >= 60 ? 'warm' : 'cold';
  return (
    <tr onClick={onClick} onKeyDown={onKey} tabIndex={0} aria-label={`Åpne ${car.title}`}>
      <td className="num" style={{ color: 'var(--ink-3)' }}>
        {String(index + 1).padStart(2, '0')}
      </td>
      <td>
        <div className="car-row">
          <div className="car-thumb">
            <CarImage
              src={car.images[0]}
              alt={car.title}
              variant="thumb"
              priority={index < 8}
            />
          </div>
          <div>
            <div className="car-name">
              {car.title}
              {car.badge && <span className={`badge ${car.badge === 'HOT' ? 'hot' : car.badge === 'NY' ? 'new' : ''}`}>{car.badge}</span>}
              {car.sellerClass === 'Forhandler' && <span className="badge dealer">FORHANDLER</span>}
            </div>
            <div className="car-sub">
              {car.year} · {fmt(car.km)} KM · {car.sellerClass}
              {car.fuel ? ` · ${car.fuel}` : ''}
            </div>
          </div>
        </div>
      </td>
      <td className="num r">{kr(car.price)}</td>
      <td className="num r" style={{ color: 'var(--ink-2)' }}>
        {kr(car.estSell)}
      </td>
      <td className={`num r ${car.margin >= 0 ? 'green' : 'red'}`}>
        {car.margin >= 0 ? '+' : ''}
        {kr(car.margin)}
      </td>
      {showSpark && !compact && (
        <td className="r">
          <MiniSpark points={car.priceHistory} />
        </td>
      )}
      <td className="r">
        <span className={`score-pill ${scoreCls}`}>{car.dealScore}</span>
      </td>
      <td>
        <span style={{ fontSize: 12 }}>◉ {car.location}</span>
      </td>
      {!compact && (
        <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          {(car.daysListed || '').toUpperCase()}
        </td>
      )}
    </tr>
  );
}

/** Filter + sort + search controls bound to a CarTable. Used in /markedet. */
export function CarTableExplorer({ cars }: { cars: Car[] }) {
  const [filter, setFilter] = useState('Alle');
  const [sort, setSort] = useState<'margin' | 'price' | 'score' | 'days'>('margin');
  const [q, setQ] = useState('');

  // Show every brand present in the dataset (user wants all car models as chips
  // on /markedet — dashboard had a hardcoded subset before).
  const brands = useMemo(() => {
    const s = new Set<string>();
    cars.forEach((c) => s.add(c.brand));
    const fromData = Array.from(s).map(capitalize).sort();
    return ['Alle', ...fromData];
  }, [cars]);

  const filtered = useMemo(() => {
    let list = cars;
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
          String(c.km).includes(qq) ||
          c.finnCode.includes(qq),
      );
    }
    list = [...list];
    if (sort === 'margin') list.sort((a, b) => b.margin - a.margin);
    if (sort === 'price') list.sort((a, b) => a.price - b.price);
    if (sort === 'score') list.sort((a, b) => b.dealScore - a.dealScore);
    if (sort === 'days') list.sort((a, b) => a.daysListedRaw - b.daysListedRaw);
    return list;
  }, [cars, filter, sort, q]);

  return (
    <>
      <div className="tx-toolbar">
        {brands.map((b) => (
          <button
            key={b}
            className={`tx-chip ${filter === b ? 'active' : ''}`}
            onClick={() => setFilter(b)}
          >
            {b}
          </button>
        ))}
        <div className="tx-search">
          <span style={{ color: 'var(--ink-3)' }} aria-hidden>
            ⌕
          </span>
          <input
            placeholder="Søk modell, by..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Søk"
          />
        </div>
        <select
          className="tx-chip"
          style={{ appearance: 'none', paddingRight: 24 }}
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sortér"
        >
          <option value="margin">Sortér: Margin ↓</option>
          <option value="price">Sortér: Pris ↑</option>
          <option value="score">Sortér: Score ↓</option>
          <option value="days">Sortér: Nyeste ↓</option>
        </select>
      </div>
      <CarTable cars={filtered} />
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
