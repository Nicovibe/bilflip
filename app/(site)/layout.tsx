import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { FooterTx } from '@/components/FooterTx';
import { loadStats } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const stats = await loadStats();
  return (
    <div className="page">
      <TopBar scannedToday={stats.scannedToday} alertsToday={3} />
      <div className="tx-shell">
        <Sidebar scannedToday={stats.scannedToday} alertsToday={3} watchCount={0} />
        <main className="main">
          {children}
          <FooterTx datapoints={stats.totalScanned} />
        </main>
      </div>
    </div>
  );
}
