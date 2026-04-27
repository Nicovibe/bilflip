'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmt, kr } from '@/lib/format';
import type { DatabaseRow } from '@/lib/database';

type StatusFilter = 'alle' | 'aktiv' | 'solgt' | 'fjernet';
type Sort = 'nyeste' | 'eldste' | 'pris-asc' | 'pris-desc' | 'flest-endringer' | 'storst-spread';

const PAGE_SIZE = 50;

export function DatabaseExplorer({ rows }: { rows: DatabaseRow[] }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('alle');
  const [sort, setSort] = useState<Sort>('flest-endringer');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = rows;
    if (status !== 'alle') list = list.filter((r) => (r.status || 'aktiv') === status);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.tittel || '').toLowerCase().includes(qq) ||
          (r.lokasjon || '').toLowerCase().includes(qq) ||
          (r.selgerType || '').toLowerCase().includes(qq) ||
          r.finn.includes(qq),
      );
    }
    list = [...list];
    if (sort === 'nyeste') list.sort((a, b) => (b.funnetDato || '').localeCompare(a.funnetDato || ''));
    if (sort === 'eldste') list.sort((a, b) => (a.funnetDato || '').localeCompare(b.funnetDato || ''));
    if (sort === 'pris-asc') list.sort((a, b) => (a.pris ?? Infinity) - (b.pris ?? Infinity));
    if (sort === 'pris-desc') list.sort((a, b) => (b.pris ?? -Infinity) - (a.pris ?? -Infinity));
    if (sort === 'flest-endringer') list.sort((a, b) => b.changeCount - a.changeCount || (b.spread - a.spread));
    if (sort === 'storst-spread') list.sort((a, b) => b.spread - a.spread);
    return list;
  }, [rows, status, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePage = Math.min(page, totalPages);
  const visible = filtered.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE);

  const onSearchChange = (value: string) => {
    setQ(value);
    setPage(1);
  };

  return (
    <>
      <div className="tx-toolbar">
        {(['alle', 'aktiv', 'solgt', 'fjernet'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`tx-chip ${status === s ? 'active' : ''}`}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
        <div className="tx-search">
          <span style={{ color: 'var(--ink-3)' }} aria-hidden>⌕</span>
          <input
            placeholder="Søk modell, by, finn-kode..."
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Søk"
          />
        </div>
        <select
          className="tx-chip"
          style={{ appearance: 'none', paddingRight: 24 }}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as Sort);
            setPage(1);
          }}
          aria-label="Sortér"
        >
          <option value="flest-endringer">Sortér: Flest prisendringer</option>
          <option value="storst-spread">Sortér: Størst spread</option>
          <option value="nyeste">Sortér: Nyeste</option>
          <option value="eldste">Sortér: Eldste</option>
          <option value="pris-asc">Sortér: Pris ↑</option>
          <option value="pris-desc">Sortér: Pris ↓</option>
        </select>
      </div>

      <div className="tx-table-wrap">
        <table className="tx-table">
          <thead>
            <tr>
              <th style={{ width: 38 }}>#</th>
              <th>Annonse</th>
              <th className="r">Pris</th>
              <th className="r">Endringer</th>
              <th className="r">Spread</th>
              <th>Status</th>
              <th>Funnet</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <DatabaseRowComponent
                key={r.finn}
                row={r}
                index={(visiblePage - 1) * PAGE_SIZE + i}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ marginTop: 16 }}>Ingen treff.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            Side {visiblePage} av {totalPages} · {filtered.length.toLocaleString('nb-NO')} annonser
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="tx-chip"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={visiblePage <= 1}
              style={visiblePage <= 1 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              ← Forrige
            </button>
            <button
              type="button"
              className="tx-chip"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={visiblePage >= totalPages}
              style={visiblePage >= totalPages ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            >
              Neste →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function DatabaseRowComponent({ row, index }: { row: DatabaseRow; index: number }) {
  const router = useRouter();
  const status = (row.status || 'aktiv') as 'aktiv' | 'solgt' | 'fjernet';
  const onClick = () => router.push(`/database/${row.finn}`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <tr onClick={onClick} onKeyDown={onKey} tabIndex={0} aria-label={`Åpne ${row.tittel}`}>
      <td className="num" style={{ color: 'var(--ink-3)' }}>{String(index + 1).padStart(4, '0')}</td>
      <td>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{row.tittel || `FINN-${row.finn}`}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          {row.aar || '?'} · {row.km != null ? `${fmt(row.km)} km` : '?'} · {row.lokasjon || '?'} · FINN-{row.finn}
        </div>
      </td>
      <td className="num r">{row.pris != null ? kr(row.pris) : '–'}</td>
      <td className="num r" style={{ color: row.changeCount > 0 ? 'var(--ink)' : 'var(--ink-3)' }}>
        {row.changeCount}
      </td>
      <td className="num r" style={{ color: row.spread > 0 ? (row.minPris != null && row.pris != null && row.pris < row.minPris + row.spread / 2 ? 'var(--green)' : 'var(--ink-2)') : 'var(--ink-3)' }}>
        {row.spread > 0 ? kr(row.spread) : '–'}
      </td>
      <td>
        <span className={`status-pill status-${status}`}>{status.toUpperCase()}</span>
      </td>
      <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
        {fmtShortDate(row.funnetDato)}
      </td>
    </tr>
  );
}

function fmtShortDate(iso: string | null): string {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return iso.slice(0, 10);
  }
}
