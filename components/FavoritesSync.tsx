'use client';
/**
 * Invisible mount-point that ensures the favorites hook runs on every page
 * a logged-in user visits — including pages that don't otherwise render a
 * FavoriteButton (the marketing landing, /abonnement, …).
 *
 * Without this, the localStorage→server migration would only fire when the
 * user lands on a page with a FavoriteButton in it, which is unreliable
 * (especially for Gratis users who can't reach /dashboard yet).
 */
import { useFavorites } from '@/lib/favorites';

export function FavoritesSync() {
  useFavorites();
  return null;
}
