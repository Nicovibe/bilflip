'use client';

import { useMemo, useState } from 'react';
import { kr } from '@/lib/format';

export type PricePoint = { p: number; t: string };
type Period = '7d' | '30d' | '90d' | 'all';

const PERIOD_DAYS: Record<Period, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

/**
 * Big interactive price chart with period selector. Used both on the gated
 * /bil/[id] detail (full analysis) and the public /database/[id] reduced view.
 *
 * Hover/tap on a point to see exact date+price. Marks the median, highlights
 * price drops in green and increases in red.
 */
export function PriceHistoryGraph({ history, fallbackPrice }: { history: PricePoint[]; fallbackPrice?: number }) {
  const [period, setPeriod] = useState<Period>('all');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    if (!history || history.length === 0) {
      // No history yet — synthesize a flat single-point dataset from current price.
      const now = new Date().toISOString();
      const fallback = typeof fallbackPrice === 'number' && Number.isFinite(fallbackPrice) ? fallbackPrice : 0;
      return [{ p: fallback, t: now }];
    }
    const days = PERIOD_DAYS[period];
    if (days == null) return history;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = history.filter((pt) => new Date(pt.t).getTime() >= cutoff);
    return filtered.length > 0 ? filtered : history.slice(-1);
  }, [history, period, fallbackPrice]);

  const w = 600;
  const h = 160;
  const padX = 12;
  const padY = 14;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const prices = points.map((p) => p.p);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const median = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  const medianY = padY + chartH - ((median - min) / range) * chartH;

  const xAt = (i: number) => padX + (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
  const yAt = (val: number) => padY + chartH - ((val - min) / range) * chartH;

  const polyPoints = points.map((pt, i) => `${xAt(i)},${yAt(pt.p)}`).join(' ');
  const areaPoints = `${xAt(0)},${padY + chartH} ${polyPoints} ${xAt(points.length - 1)},${padY + chartH}`;

  const first = points[0];
  const last = points[points.length - 1];
  const change = (last?.p ?? 0) - (first?.p ?? 0);
  const changePct = first?.p ? (change / first.p) * 100 : 0;

  const totalChanges = history && history.length > 0 ? history.length - 1 : 0;
  const hover = hoverIdx != null && points[hoverIdx] ? points[hoverIdx] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(Object.keys(PERIOD_DAYS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`tx-chip ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {p === 'all' ? 'Alt' : p}
            </button>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>
          {points.length} obs · {totalChanges} endring{totalChanges === 1 ? '' : 'er'}
          {change !== 0 && (
            <span style={{ marginLeft: 8, color: change < 0 ? 'var(--green)' : 'var(--red)' }}>
              {change < 0 ? '↘' : '↗'} {kr(Math.abs(change))} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%)
            </span>
          )}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 180, cursor: 'crosshair' }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="phgFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(95,200,143,0.25)" />
            <stop offset="100%" stopColor="rgba(95,200,143,0)" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#phgFill)" />
        <polyline points={polyPoints} fill="none" stroke="var(--green)" strokeWidth="1.6" />
        <line
          x1={padX}
          y1={medianY}
          x2={w - padX}
          y2={medianY}
          stroke="var(--ink-3)"
          strokeWidth="0.8"
          strokeDasharray="3 4"
          opacity="0.5"
        />
        <text
          x={w - padX - 4}
          y={medianY - 4}
          textAnchor="end"
          fontSize="9"
          fill="var(--ink-3)"
          fontFamily="JetBrains Mono"
        >
          MEDIAN {kr(median)}
        </text>
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={xAt(i)}
              cy={yAt(pt.p)}
              r={hoverIdx === i ? 5 : 2.5}
              fill="var(--green)"
              stroke="var(--surface-1, white)"
              strokeWidth="1"
            />
            {/* Invisible hover hit target */}
            <rect
              x={xAt(i) - 16}
              y={padY}
              width={32}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseMove={() => setHoverIdx(i)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}
        {hover && (
          <g>
            <line
              x1={xAt(hoverIdx!)}
              y1={padY}
              x2={xAt(hoverIdx!)}
              y2={padY + chartH}
              stroke="var(--ink-3)"
              strokeWidth="0.6"
              strokeDasharray="2 3"
              opacity="0.6"
            />
            <text
              x={xAt(hoverIdx!)}
              y={padY - 2}
              textAnchor={hoverIdx! < points.length / 2 ? 'start' : 'end'}
              fontSize="11"
              fill="var(--ink)"
              fontFamily="JetBrains Mono"
            >
              {kr(hover.p)} · {fmtDate(hover.t)}
            </text>
          </g>
        )}
      </svg>

      {/* Min/max labels along bottom */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--ink-3)',
          marginTop: 4,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <span>FRA · {fmtDate(first?.t ?? '')} · {kr(first?.p ?? 0)}</span>
        <span>NÅ · {fmtDate(last?.t ?? '')} · {kr(last?.p ?? 0)}</span>
      </div>

      {/* Change list (only show actual changes, not snapshots) */}
      {totalChanges > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--ink-2)', userSelect: 'none' }}>
            Vis alle prisendringer ({totalChanges})
          </summary>
          <table style={{ width: '100%', marginTop: 8, fontSize: 12 }}>
            <thead>
              <tr style={{ color: 'var(--ink-3)', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 10 }}>
                <th style={{ padding: '4px 0' }}>DATO</th>
                <th style={{ padding: '4px 0' }}>PRIS</th>
                <th style={{ padding: '4px 0', textAlign: 'right' }}>ENDRING</th>
              </tr>
            </thead>
            <tbody>
              {history.map((pt, i) => {
                const prev = i > 0 ? history[i - 1].p : null;
                const delta = prev != null ? pt.p - prev : 0;
                return (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td className="mono" style={{ padding: '4px 0', color: 'var(--ink-3)', fontSize: 11 }}>
                      {fmtDateTime(pt.t)}
                    </td>
                    <td style={{ padding: '4px 0' }}>{kr(pt.p)}</td>
                    <td
                      className="mono"
                      style={{
                        padding: '4px 0',
                        textAlign: 'right',
                        color: delta === 0 ? 'var(--ink-3)' : delta < 0 ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {prev == null ? '—' : delta === 0 ? '0' : `${delta < 0 ? '' : '+'}${kr(delta)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return iso.slice(0, 10);
  }
}

function fmtDateTime(iso: string): string {
  if (!iso) return '–';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: '2-digit' })} ${d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return iso;
  }
}
