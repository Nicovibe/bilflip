import { locationToSvg, googleMapsUrl } from '@/lib/locations';

/**
 * Stylised SVG map of Norway with a dot at the seller's city.
 *
 * The dot position comes from lib/locations (curated city → lat/lng table,
 * linearly projected onto the SVG viewBox). The whole map is a link that
 * opens Google Maps with the location pre-searched in a new tab.
 */
export function DetailMap({ location }: { location: string }) {
  const { x, y, matched } = locationToSvg(location);
  const href = googleMapsUrl(location);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="map-tx"
      aria-label={`Åpne ${location} i Google Maps (ny fane)`}
      title={`Åpne ${location} i Google Maps`}
      style={{ aspectRatio: '4/3', display: 'block', cursor: 'pointer' }}
    >
      <svg viewBox="0 0 200 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <defs>
          <pattern id="dotstx" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="0.5" fill="rgba(95,200,143,0.25)" />
          </pattern>
        </defs>
        <rect width="200" height="240" fill="url(#dotstx)" />
        <path
          d="M 80 10 L 90 30 L 100 50 L 95 70 L 110 80 L 100 100 L 115 115 L 105 130 L 120 145 L 110 160 L 125 175 L 115 195 L 130 220 L 60 225 L 50 200 L 60 180 L 50 160 L 60 140 L 50 120 L 65 100 L 60 80 L 70 60 L 65 40 Z"
          fill="rgba(95,200,143,0.08)"
          stroke="var(--green)"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        {/* Pulse halo + dot. Halo radius widens slightly when we have a real
            match so confident locations look more anchored than the fallback. */}
        <circle cx={x} cy={y} r={matched ? 14 : 10} fill="rgba(95,200,143,0.2)" />
        <circle cx={x} cy={y} r="5" fill="var(--green)" />
        <circle cx={x} cy={y} r="2" fill="var(--bg)" />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'var(--green)',
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: 3,
          border: '1px solid var(--line)',
        }}
      >
        ◉ {location.toUpperCase()}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontFamily: 'var(--mono)',
          fontSize: 9,
          letterSpacing: '0.08em',
          color: 'var(--ink-3)',
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: 3,
          border: '1px solid var(--line)',
          textTransform: 'uppercase',
        }}
      >
        Google Maps ↗
      </div>
    </a>
  );
}
