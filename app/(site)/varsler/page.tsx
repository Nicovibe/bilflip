import { ComingSoon } from '@/components/ComingSoon';

export const metadata = { title: 'Varsler — bilvipp' };

export default function VarslerPage() {
  return (
    <ComingSoon
      feature="Telegram-varsler i sanntid"
      description="Vi setter opp en bot som pinger deg når en bil med margin over din terskel dukker opp på finn.no. Telegram-kanalen lanseres i Q2 — meld deg på via kontaktsiden så blir du blant de første."
    />
  );
}
