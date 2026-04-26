/**
 * Stylised "HQ neighborhood" map for the about page.
 * TODO(map): replace with real Mapbox dark-mode tile when ready.
 */
export function BigMap() {
  return (
    <div className="map-tx" style={{ aspectRatio: '21/8' }}>
      <svg
        viewBox="0 0 1280 480"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <defs>
          <pattern id="bigdotstx" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.6" fill="rgba(95,200,143,0.18)" />
          </pattern>
        </defs>
        <rect width="1280" height="480" fill="url(#bigdotstx)" />
        <path d="M 0 260 L 1280 220" stroke="var(--surface-3)" strokeWidth="22" />
        <path d="M 0 260 L 1280 220" stroke="var(--line-2)" strokeWidth="2" strokeOpacity="0.4" />
        <path d="M 270 0 L 300 480" stroke="var(--surface-3)" strokeWidth="18" />
        <path d="M 270 0 L 300 480" stroke="var(--line-2)" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 870 0 L 920 480" stroke="var(--surface-3)" strokeWidth="14" />
        <path d="M 0 80 L 1280 100" stroke="var(--surface-3)" strokeWidth="10" />
        <path d="M 0 400 L 1280 380" stroke="var(--surface-3)" strokeWidth="10" />
        <rect x="340" y="120" width="490" height="100" fill="rgba(95,200,143,0.04)" rx="4" />
        <rect x="340" y="290" width="490" height="100" fill="rgba(95,200,143,0.04)" rx="4" />
        <rect x="970" y="120" width="260" height="100" fill="rgba(95,200,143,0.04)" rx="4" />
        <rect x="60" y="120" width="180" height="100" fill="rgba(95,200,143,0.04)" rx="4" />
        <rect x="640" y="140" width="100" height="70" fill="rgba(95,200,143,0.18)" rx="4" />
        <text
          x="690"
          y="184"
          textAnchor="middle"
          fontSize="11"
          fill="var(--green)"
          fontFamily="JetBrains Mono"
          letterSpacing="0.04em"
        >
          FROGNERPARKEN
        </text>
        <text
          x="220"
          y="256"
          fontSize="10"
          fill="var(--ink-3)"
          fontFamily="JetBrains Mono"
          letterSpacing="0.06em"
        >
          DRAMMENSVEIEN
        </text>
      </svg>
      <div style={{ position: 'absolute', left: '52%', top: '48%', transform: 'translate(-50%,-100%)' }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--green)',
            border: '3px solid var(--bg)',
            boxShadow: '0 0 0 4px rgba(95,200,143,0.18), 0 6px 18px rgba(0,0,0,0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            padding: '10px 14px',
            minWidth: 220,
            border: '1px solid var(--green)',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>bilvipp HQ</div>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--ink-3)',
              marginTop: 4,
              letterSpacing: '0.08em',
            }}
          >
            KARENSLYST ALLÉ 53
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'var(--ink-3)',
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: 3,
          border: '1px solid var(--line)',
        }}
      >
        59.9168°N · 10.6850°E · ZOOM 14
      </div>
    </div>
  );
}
