'use client';
import Image from 'next/image';
import { useState } from 'react';
import { CarThumbPlaceholder } from './CarThumbPlaceholder';

type Props = {
  src: string | null | undefined;
  alt: string;
  /** thumb=fixed-size table thumb, hero=large detail hero, gallery=square gallery thumb */
  variant: 'thumb' | 'hero' | 'gallery';
  /** Hint for next/image responsive sizing. */
  sizes?: string;
  /** Mark first listing thumb above the fold so Next prioritizes it. */
  priority?: boolean;
};

/**
 * Wraps next/image with a graceful fallback to <CarThumbPlaceholder />:
 *   1. If `src` is missing, render placeholder.
 *   2. If the image errors at runtime (finn pulled the photo, etc.), swap to placeholder.
 *
 * Sizing comes from the surrounding container (we use `fill`), so callers must
 * give us a positioned wrapper with explicit width/height. This is the case for
 * .car-thumb, .detail-photo-tx, and .detail-thumb-tx in globals.css.
 */
export function CarImage({ src, alt, variant, sizes, priority = false }: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <CarThumbPlaceholder ariaLabel={alt} />;
  }

  // Defaults match the surrounding container size hints in globals.css.
  // Hero: full-width detail photo. Thumb: fixed 56x42. Gallery: ~140x96 thumb.
  const computedSizes =
    sizes ??
    (variant === 'hero'
      ? '(max-width: 768px) 100vw, 720px'
      : variant === 'gallery'
        ? '160px'
        : '64px');

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={computedSizes}
      priority={priority}
      // finn-CDN doesn't require Referer, but we send a benign policy anyway —
      // some CDNs reject when the page sends a long URL as Referer.
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      style={{ objectFit: 'cover' }}
    />
  );
}
