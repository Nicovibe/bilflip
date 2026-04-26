'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import type { Car } from '@/lib/mapping';
import { useFavorites } from '@/lib/favorites';
import { CarTable } from './CarTable';

/**
 * Dashboard view: shows only cars the user has starred.
 * Reads favorite finn-codes from localStorage and filters the full car list.
 * Renders a guidance empty state if nothing is favorited yet.
 */
export function FavoritesView({ cars }: { cars: Car[] }) {
  const { ids } = useFavorites();

  const favCars = useMemo(() => {
    if (ids.length === 0) return [];
    const order = new Map(ids.map((id, i) => [id, i]));
    return cars
      .filter((c) => order.has(c.finnCode))
      .sort((a, b) => (order.get(a.finnCode) ?? 0) - (order.get(b.finnCode) ?? 0));
  }, [cars, ids]);

  if (favCars.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ marginBottom: 14 }}>Ingen favoritter enda.</p>
        <p style={{ marginBottom: 22, color: 'var(--ink-3)', fontSize: 13 }}>
          Gå til markedet, åpne en bil, og trykk <strong>★ Watch</strong> for å lagre.
        </p>
        <Link href="/markedet" className="btn btn-primary">
          Åpne markedet →
        </Link>
      </div>
    );
  }

  return <CarTable cars={favCars} />;
}
