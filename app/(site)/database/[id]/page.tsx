import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadDatabaseRow } from '@/lib/database';
import { fmt, kr } from '@/lib/format';
import { PriceHistoryGraph } from '@/components/PriceHistoryGraph';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { row } = await loadDatabaseRow(id);
  if (!row) return { title: 'Annonse ikke funnet — bilvipp' };
  return {
    title: `${row.tittel} — bilvipp database`,
    description: `${row.aar || ''} · ${row.km != null ? fmt(row.km) + ' km' : ''} · ${row.lokasjon}`,
  };
}

export default async function DatabaseDetail({ params }: Props) {
  const { id } = await params;
  const { row, history } = await loadDatabaseRow(id);
  if (!row) notFound();

  const status = (row.status || 'aktiv') as 'aktiv' | 'solgt' | 'fjernet';

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ DATABASE / FINN-{row.finn}</div>
          <div className="subhead-title">{row.tittel}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`status-pill status-${status}`}>{status.toUpperCase()}</span>
          <Link href="/database" className="btn btn-secondary">← Til databasen</Link>
          {row.lenke && (
            <a className="btn btn-primary" href={row.lenke} target="_blank" rel="noopener noreferrer">
              Åpne på finn.no →
            </a>
          )}
        </div>
      </div>

      <div className="section-tx" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="tx-card">
          <div className="tx-card-h">
            <h4>PRISHISTORIKK · {history.length > 0 ? history.length : 1} OBSERVASJON{(history.length || 1) === 1 ? '' : 'ER'}</h4>
            <span className="badge-on">{status.toUpperCase()}</span>
          </div>
          <PriceHistoryGraph history={history} fallbackPrice={row.pris ?? undefined} />
        </div>

        <div className="tx-card">
          <div className="tx-card-h">
            <h4>SPESIFIKASJONER</h4>
          </div>
          <div className="kv-row"><span className="k">Pris nå</span><span className="v">{row.pris != null ? kr(row.pris) : '–'}</span></div>
          <div className="kv-row"><span className="k">Årgang</span><span className="v">{row.aar || '–'}</span></div>
          <div className="kv-row"><span className="k">Km</span><span className="v">{row.km != null ? fmt(row.km) : '–'}</span></div>
          {row.drivstoff && <div className="kv-row"><span className="k">Drivstoff</span><span className="v">{row.drivstoff}</span></div>}
          <div className="kv-row"><span className="k">Lokasjon</span><span className="v">{row.lokasjon || '–'}</span></div>
          {row.selgerType && <div className="kv-row"><span className="k">Selger</span><span className="v">{row.selgerType}</span></div>}
          <div className="kv-row"><span className="k">Status</span><span className="v">{status}</span></div>
          <div className="kv-row"><span className="k">Funnet</span><span className="v mono" style={{ fontSize: 11 }}>{fmtDateTime(row.funnetDato)}</span></div>
          <div className="kv-row"><span className="k">Sist sett</span><span className="v mono" style={{ fontSize: 11 }}>{fmtDateTime(row.sistSett)}</span></div>
          <div className="kv-row"><span className="k">Sist oppdatert</span><span className="v mono" style={{ fontSize: 11 }}>{fmtDateTime(row.sistOppdatert)}</span></div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: '1px solid var(--line)',
              fontSize: 11,
              color: 'var(--ink-3)',
              lineHeight: 1.6,
            }}
          >
            Denne visningen er <strong>uten AI-analyse</strong>. For full kalkyle og flippscore må
            bilen være i <Link href="/markedet" style={{ color: 'var(--ink-2)' }}>Markedet</Link>.
            {status === 'solgt' && ' Annonsen er solgt.'}
            {status === 'fjernet' && ' Annonsen er fjernet fra finn.'}
          </div>
        </div>
      </div>
    </>
  );
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return iso;
  }
}
