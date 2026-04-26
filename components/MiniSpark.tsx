/**
 * Inline SVG sparkline. Pass real prisData where available.
 * Falls back to a flat line when only one data point exists.
 */
export function MiniSpark({
  points,
  down = false,
  width = 60,
  height = 22,
}: {
  points: number[];
  down?: boolean;
  width?: number;
  height?: number;
}) {
  const data = points && points.length > 1 ? points : [points?.[0] ?? 0, points?.[0] ?? 0];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((p, i) => `${(i / (data.length - 1)) * width},${height - ((p - min) / range) * height}`)
    .join(' ');
  // Determine direction from first/last when not forced
  const isDown = down ?? data[data.length - 1] < data[0];
  const stroke = isDown ? 'var(--red)' : 'var(--green)';
  return (
    <svg className="spark-mini" viewBox={`0 0 ${width} ${height}`} style={{ display: 'inline-block' }} aria-hidden>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
