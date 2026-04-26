import Link from 'next/link';
import { loadCars } from '@/lib/data';
import { FavoritesView } from '@/components/FavoritesView';

export const metadata = {
  title: 'Dashboard — bilvipp',
  description: 'Bilene du har lagret som favoritter.',
};

/**
 * Dashboard now serves a single role: list the user's favorited cars.
 * Browsing/filtering happens on /markedet. The favorites set lives in
 * localStorage (lib/favorites) and is read client-side by <FavoritesView>.
 */
export default async function DashboardPage() {
  const cars = await loadCars();

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ DASHBOARD / MINE FAVORITTER</div>
          <div className="subhead-title">
            Mine favoritter
          </div>
        </div>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <Link href="/markedet" className="btn btn-secondary">
            Til markedet →
          </Link>
        </div>
      </div>
      <div className="section-tx" style={{ padding: '24px 24px' }}>
        <FavoritesView cars={cars} />
      </div>
    </>
  );
}
