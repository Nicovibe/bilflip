'use client';
import { useFavorites } from '@/lib/favorites';

/**
 * Star/un-star a car. Persists to localStorage via lib/favorites.
 * /dashboard reads the same store and renders only the starred cars.
 */
export function FavoriteButton({
  finnCode,
  variant = 'compact',
}: {
  finnCode: string;
  variant?: 'compact' | 'wide';
}) {
  const { has, toggle } = useFavorites();
  const fav = has(finnCode);
  const className = variant === 'wide'
    ? 'btn btn-secondary btn-lg'
    : 'btn btn-secondary';
  const style = variant === 'wide'
    ? { width: '100%', justifyContent: 'center' as const, marginTop: 6 }
    : undefined;
  const label = variant === 'wide'
    ? (fav ? '★ Lagret · klikk for å fjerne' : '★ Lagre · vis i dashboard')
    : (fav ? '★ Lagret' : '★ Watch');

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => toggle(finnCode)}
      aria-pressed={fav}
      title={fav ? 'Fjern fra favoritter' : 'Legg til favoritter'}
    >
      {label}
    </button>
  );
}
