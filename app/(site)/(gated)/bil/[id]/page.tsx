import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadCar } from '@/lib/data';
import { fmt, kr } from '@/lib/format';
import { valuationSourceLabel, anbefalingLabel } from '@/lib/mapping';
import { CarGallery } from '@/components/CarGallery';
import { BigSpark } from '@/components/BigSpark';
import { DetailMap } from '@/components/DetailMap';
import { FavoriteButton } from '@/components/FavoriteButton';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const car = await loadCar(id);
  if (!car) return { title: 'Bil ikke funnet — bilvipp' };
  return {
    title: `${car.title} — bilvipp`,
    description: `${car.year} · ${fmt(car.km)} km · ${car.location}. ${car.ai}`,
  };
}

export default async function BilDetalj({ params }: Props) {
  const { id } = await params;
  const car = await loadCar(id);
  if (!car) notFound();

  // Calculation (uses real per-car omreg/klargj from scraper, plus a finance estimate)
  const finans = Math.round(car.price * 0.012);
  const totKost = car.price + car.omreg + car.klargjoring + finans;
  const netto = car.estSell - totKost;

  const confidenceLabel: Record<NonNullable<typeof car.confidence>, string> = {
    high: 'Høy tillit',
    medium: 'Medium tillit',
    low: 'Lav tillit',
  };
  const anb = anbefalingLabel(car.anbefaling);

  // AI score breakdown (derived from the rich data we have)
  const aiBars = [
    { label: 'Pris vs marked', value: clamp(car.dealScore) },
    { label: 'Comp-tillit', value: car.compConfidence === 'high' ? 90 : car.compConfidence === 'medium' ? 65 : 40 },
    { label: 'Selger-profil', value: car.sellerClass === 'Privat' ? 88 : car.sellerClass === 'Forhandler' ? 60 : 50 },
    { label: 'Tilstand-flagg', value: car.damageFlags.length === 0 ? 84 : 40 },
  ];

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ MARKEDET / FINN-{car.finnCode}</div>
          <div className="subhead-title">
            {car.title} — <em>{car.margin >= 0 ? '+' : ''}{kr(car.margin)}</em>
          </div>
        </div>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <Link href="/markedet" className="btn btn-secondary">
            ← Til markedet
          </Link>
          <FavoriteButton finnCode={car.finnCode} variant="compact" />
          <a
            className="btn btn-primary"
            href={`https://www.finn.no/mobility/item/${car.finnCode}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Åpne på finn.no →
          </a>
        </div>
      </div>

      <div className="detail-tx">
        <div className="detail-tx-grid">
          <div>
            {/* Gallery — fetched from finn.no by scripts/fetch-images.mjs */}
            <CarGallery images={car.images} alt={car.title} />

            {/* Specs */}
            <div className="tx-card" style={{ marginTop: 24 }}>
              <div className="tx-card-h">
                <h4>SPESIFIKASJONER</h4>
                <span className="badge-on">FRA FINN.NO</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                <div className="kv-row"><span className="k">Årgang</span><span className="v">{car.year}</span></div>
                <div className="kv-row"><span className="k">Km</span><span className="v">{fmt(car.km)}</span></div>
                <div className="kv-row"><span className="k">Lokasjon</span><span className="v">{car.location}</span></div>
                <div className="kv-row"><span className="k">Selger</span><span className="v">{car.sellerClass}</span></div>
                {car.fuel && (
                  <div className="kv-row"><span className="k">Drivstoff</span><span className="v">{car.fuel}</span></div>
                )}
                {car.drivetrain && (
                  <div className="kv-row"><span className="k">Drivlinje</span><span className="v">{car.drivetrain}</span></div>
                )}
                {car.battery && (
                  <div className="kv-row"><span className="k">Batteri</span><span className="v">{car.battery}</span></div>
                )}
                {car.rangeKm && (
                  <div className="kv-row"><span className="k">WLTP</span><span className="v">{car.rangeKm} km</span></div>
                )}
                <div className="kv-row"><span className="k">Listet</span><span className="v">{car.daysListed}</span></div>
                <div className="kv-row"><span className="k">Finn-kode</span><span className="v">{car.finnCode}</span></div>
              </div>
              {(!car.drivetrain || !car.battery) && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--line)',
                    fontSize: 11,
                    fontFamily: 'var(--mono)',
                    color: 'var(--ink-3)',
                    letterSpacing: '0.04em',
                  }}
                >
                  ◐ Detaljerte tekniske spesifikasjoner kommer i v2.1
                </div>
              )}
            </div>

            {/* Price history */}
            <div className="tx-card" style={{ marginTop: 16 }}>
              <div className="tx-card-h">
                <h4>PRISHISTORIKK · {car.priceHistory.length} PUNKTER</h4>
                {car.priceChange !== 0 && (
                  <span className="mono" style={{ fontSize: 11, color: car.priceChange < 0 ? 'var(--green)' : 'var(--red)' }}>
                    {car.priceChange < 0 ? '↘' : '↗'} {kr(Math.abs(car.priceChange))}
                  </span>
                )}
              </div>
              <BigSpark points={car.priceHistory} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: 'var(--ink-3)',
                  marginTop: 8,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span>FØRSTE PRIS · {kr(car.priceHistory[0])}</span>
                <span>NÅ · {kr(car.priceHistory[car.priceHistory.length - 1])}</span>
              </div>
              <p className="note-line">{car.ai}</p>
              {car.aiViktigsteRisiko && (
                <p className="note-line" style={{ color: 'var(--red)', borderTop: '1px solid var(--red-bg)' }}>
                  <strong>Viktigste risiko:</strong> {car.aiViktigsteRisiko}
                </p>
              )}
            </div>

            {/* Reasons & negotiation */}
            {(car.reasons.length > 0 || car.negotiation.length > 0) && (
              <div className="tx-card" style={{ marginTop: 16 }}>
                <div className="tx-card-h">
                  <h4>HVORFOR · OG HVORDAN BUDJE</h4>
                </div>
                {car.reasons.length > 0 && (
                  <>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color: 'var(--green)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Hvorfor nå
                    </div>
                    <ul style={{ listStyle: 'none', marginBottom: 18 }}>
                      {car.reasons.map((r, i) => (
                        <li
                          key={i}
                          style={{ padding: '6px 0', fontSize: 13, color: 'var(--ink-2)', borderBottom: '1px solid var(--line)' }}
                        >
                          → {r}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {car.negotiation.length > 0 && (
                  <>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        color: 'var(--blue)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Forhandlingsrom
                    </div>
                    <ul style={{ listStyle: 'none' }}>
                      {car.negotiation.map((r, i) => (
                        <li
                          key={i}
                          style={{ padding: '6px 0', fontSize: 13, color: 'var(--ink-2)', borderBottom: '1px solid var(--line)' }}
                        >
                          → {r}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Calculation */}
            <div className="tx-card" style={{ padding: 24 }}>
              <div className="tx-card-h">
                <h4>FLIPPING-KALKYLE</h4>
                <span className="badge-on">SCORE {car.dealScore}</span>
              </div>
              {anb && (
                <div style={{ marginBottom: 12 }}>
                  <span className={`tag-pill ${anb.tone}`}>{anb.label}</span>
                  {car.confidence && (
                    <span className={`tag-pill ${car.confidence === 'high' ? 'g' : car.confidence === 'medium' ? 'b' : 'r'}`}>
                      {confidenceLabel[car.confidence]}
                    </span>
                  )}
                </div>
              )}
              <div className="kv-row"><span className="k">Annonsepris</span><span className="v">{kr(car.price)}</span></div>
              <div className="kv-row"><span className="k">Omregistrering</span><span className="v">{kr(car.omreg)}</span></div>
              <div className="kv-row"><span className="k">Klargjøring</span><span className="v">{kr(car.klargjoring)}</span></div>
              <div className="kv-row"><span className="k">Finans (60d, 1.2%)</span><span className="v">{kr(finans)}</span></div>
              <div className="kv-row"><span className="k">Sum kost</span><span className="v" style={{ color: 'var(--ink)' }}>{kr(totKost)}</span></div>
              <div className="kv-row"><span className="k">Est. salgspris</span><span className="v" style={{ color: 'var(--ink)' }}>{kr(car.estSell)}</span></div>
              <div className="kv-row total"><span className="k">NETTO FORTJENESTE</span><span className="v">{netto >= 0 ? '+' : ''}{kr(netto)}</span></div>
              {car.lowballTarget && (
                <div className="kv-row"><span className="k">Lavt bud-anker</span><span className="v" style={{ color: 'var(--gold)' }}>{kr(car.lowballTarget)}</span></div>
              )}
              <a
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
                href={`https://www.finn.no/mobility/item/${car.finnCode}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Åpne på finn.no →
              </a>
              <FavoriteButton finnCode={car.finnCode} variant="wide" />
            </div>

            {/* AI score breakdown */}
            <div className="tx-card">
              <div className="tx-card-h">
                <h4>AI-ANALYSE</h4>
                <span className="badge-on">{car.dealScore}/100</span>
              </div>
              <div>
                {aiBars.map((b) => (
                  <div key={b.label} className="ai-bar-row">
                    <div className="lbl">
                      <span>{b.label}</span>
                      <span className="v">{b.value}</span>
                    </div>
                    <div className="ai-bar-track">
                      <div
                        className={`ai-bar-fill ${b.value >= 75 ? '' : b.value >= 60 ? 'warm' : 'cold'}`}
                        style={{ width: `${b.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {car.damageFlags.length > 0 && (
                <p className="note-line" style={{ color: 'var(--red)' }}>
                  <strong>OBS:</strong> {car.damageFlags.join(' · ')}
                </p>
              )}
            </div>

            {/* Comp data */}
            <div className="tx-card">
              <div className="tx-card-h">
                <h4>VALUATION & COMPS</h4>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                  {(car.compConfidence || '–').toUpperCase()}
                </span>
              </div>
              <div className="kv-row"><span className="k">Kilde</span><span className="v">{valuationSourceLabel(car.valuationSource)}</span></div>
              {car.compCount !== null && (
                <div className="kv-row"><span className="k">Komper</span><span className="v">{car.compCount}</span></div>
              )}
              {car.compSpreadPct !== null && (
                <div className="kv-row"><span className="k">Spread</span><span className="v">{car.compSpreadPct}%</span></div>
              )}
              {car.bucketMedianPrivate !== null && (
                <div className="kv-row"><span className="k">Privat median</span><span className="v">{kr(car.bucketMedianPrivate)}</span></div>
              )}
              {car.bucketMedianDealer !== null && (
                <div className="kv-row"><span className="k">Dealer median</span><span className="v">{kr(car.bucketMedianDealer)}</span></div>
              )}
              {car.medianMargin !== null && (
                <div className="kv-row"><span className="k">Median margin</span><span className="v" style={{ color: car.medianMargin >= 0 ? 'var(--green)' : 'var(--red)' }}>{car.medianMargin >= 0 ? '+' : ''}{kr(car.medianMargin)}</span></div>
              )}
            </div>

            {/* Map */}
            <div className="tx-card">
              <div className="tx-card-h">
                <h4>SELGERS LOKASJON</h4>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                  {car.location.toUpperCase()}
                </span>
              </div>
              <DetailMap location={car.location} />
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  lineHeight: 1.55,
                  paddingTop: 14,
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  REGION
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{car.location}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
