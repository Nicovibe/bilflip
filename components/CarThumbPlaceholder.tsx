/**
 * Placeholder thumbnail for cars — used until the scraper supplies real images.
 * Mark every usage so we can find them later: <CarThumbPlaceholder /> in code.
 *
 * TODO(images): replace with <img src={car.img} /> when scraper supplies img field.
 */
export function CarThumbPlaceholder({
  className = '',
  ariaLabel = 'Bilbilde kommer',
}: {
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #1a201c 0%, #232a25 100%)',
        fontFamily: 'var(--mono)',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--green)',
        letterSpacing: '0',
      }}
    >
      b
    </div>
  );
}
