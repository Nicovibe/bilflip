import { loadDatabase, loadDatabaseStats } from '@/lib/database';
import { DatabaseExplorer } from '@/components/DatabaseExplorer';

export const metadata = {
  title: 'Database — bilvipp',
  description: 'Hele scraper-databasen: alle annonser bilvipp har sett — aktive, solgte og fjernede. Søk, filtrer og se prisendringer over tid.',
};

export default async function DatabasePage() {
  const [rows, stats] = await Promise.all([loadDatabase(), loadDatabaseStats()]);

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ DATABASE</div>
          <div className="subhead-title">
            Hele databasen — <em>{stats.total.toLocaleString('nb-NO')} annonser</em>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>AKTIV {stats.aktiv.toLocaleString('nb-NO')}</span>
          <span>SOLGT {stats.solgt.toLocaleString('nb-NO')}</span>
          <span>FJERNET {stats.fjernet.toLocaleString('nb-NO')}</span>
          <span>MED ENDRINGER {stats.withChanges.toLocaleString('nb-NO')}</span>
        </div>
      </div>

      <div className="section-tx">
        <p style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 720, marginBottom: 16 }}>
          Alle bilvipp-annonser, inkludert de som er solgt eller fjernet fra finn.no. Trykk på en bil
          for å se prisendringer over tid. <strong>Markedet</strong>-fanen viser kun aktive biler med
          fullstendig AI-analyse — denne fanen er hele datakilden.
        </p>
        <DatabaseExplorer rows={rows} />
      </div>
    </>
  );
}
