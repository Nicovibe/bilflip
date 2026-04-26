'use client';
import { useState } from 'react';
import { CarImage } from './CarImage';

/**
 * Detail-page gallery: one big hero photo + horizontal-scroll thumbnail strip.
 * - Click a thumb → swaps the hero.
 * - Empty `images` → renders the placeholder.
 * - Single image → hero only, no thumb strip.
 *
 * Layout/sizing comes from .detail-photo-tx and .detail-thumb-tx in globals.css.
 */
export function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const heroSrc = images[active] ?? null;
  const showStrip = images.length > 1;

  return (
    <>
      <div className="detail-photo-tx" aria-label={alt}>
        <CarImage src={heroSrc} alt={alt} variant="hero" priority />
      </div>
      {showStrip && (
        <div
          className="detail-thumbs-tx"
          role="tablist"
          aria-label={`Bildegalleri (${images.length} bilder)`}
        >
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Bilde ${i + 1} av ${images.length}`}
              className={`detail-thumb-tx ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <CarImage src={url} alt="" variant="gallery" />
            </button>
          ))}
        </div>
      )}
      <div
        style={{
          marginTop: 6,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--ink-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {images.length === 0
          ? '\u25D0 Bilder kommer'
          : `\u25D0 ${images.length} bilder fra finn.no`}
      </div>
    </>
  );
}
