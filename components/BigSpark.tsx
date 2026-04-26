/**
 * Full-width sparkline used on the detail page. Shows real price history
 * from `points` (Car.priceHistory), with a dashed reference line at the median.
 */
export function BigSpark({ points }: { points: number[] }) {
  const data = points && points.length > 1 ? points : [points?.[0] ?? 0, points?.[0] ?? 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 600;
  const h = 100;
  const pts = data
    .map((p, i) => `${(i / (data.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  const median = data.slice().sort((a, b) => a - b)[Math.floor(data.length / 2)];
  const medianY = h - ((median - min) / range) * h;
  const lastY = h - ((data[data.length - 1] - min) / range) * h;
  return (
    <svg viewBox={`0 0 ${w} ${h + 10}`} style={{ width: '100%', height: 120 }} aria-hidden>
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(95,200,143,0.25)" />
          <stop offset="100%" stopColor="rgba(95,200,143,0)" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sparkfill)" />
      <polyline points={pts} fill="none" stroke="var(--green)" strokeWidth="1.6" />
      <line
        x1="0"
        y1={medianY}
        x2={w}
        y2={medianY}
        stroke="var(--ink-3)"
        strokeWidth="0.8"
        strokeDasharray="3 4"
        opacity="0.5"
      />
      <text
        x={w - 4}
        y={medianY - 4}
        textAnchor="end"
        fontSize="10"
        fill="var(--ink-3)"
        fontFamily="JetBrains Mono"
      >
        MEDIAN
      </text>
      <circle cx={w} cy={lastY} r="3" fill="var(--green)" />
    </svg>
  );
}
