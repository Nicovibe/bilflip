import { ComingSoon } from '@/components/ComingSoon';

export const metadata = { title: 'Watchlist — bilvipp' };

export default function WatchlistPage() {
  return (
    <ComingSoon
      feature="Watchlist & prisalert"
      description="Marker biler du følger med på, og få varsel ved prisfall eller ny annonse. Krever login med ekte konto — kommer i v2.1 sammen med Vipps Login."
    />
  );
}
