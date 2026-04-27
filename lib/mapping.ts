/**
 * Maps the raw scraper output (data/biler.json) into a stable Car shape
 * that the UI components consume. Keeps UI decoupled from scraper changes.
 */

import { computeBars, type Bars } from './scoring';

export type RawCar = Record<string, unknown> & {
  id: number;
  merke: string;
  tittel: string;
  sub?: string;
  aar: number;
  km: number;
  lok: string;
  pris: number;
  gevinst: number;
  omreg?: number;
  klargjoring?: number;
  salgspris: number;
  score: number;
  dealScore?: number;
  anbefaling?: 'KJØP' | 'VURDER' | 'SKIP' | string;
  ai?: string;
  aiUsikkerhet?: string | null;
  aiViktigsteRisiko?: string | null;
  finn: string;
  prisData?: number[];
  prisEndring?: number;
  reasons?: string[];
  negotiation?: string[];
  damageFlags?: string[];
  duplicateCount?: number;
  duplicateRisk?: string;
  confidence?: 'high' | 'medium' | 'low';
  confidenceScore?: number;
  compConfidence?: 'high' | 'medium' | 'low' | null;
  compCount?: number | null;
  compSpreadPct?: number | null;
  bucketMedianPrivate?: number | null;
  bucketMedianDealer?: number | null;
  bucketP25Private?: number | null;
  bucketP25Dealer?: number | null;
  lowballTarget?: number | null;
  lowballMargin?: number | null;
  medianMargin?: number | null;
  valuationSource?: string | null;
  valuationGap?: number | null;
  selgerKlasse?: 'private' | 'private_likely' | 'dealer' | 'body_shop' | 'unknown' | string;
  selgerType?: string;
  dager?: string;
  dagerRaw?: number;
  tags?: Array<{ t: string; c: string }>;
  priceDrops?: number;
  drivstoff?: string | null;
  images?: string[];
};

export type Tag = { label: string; tone: 'g' | 'b' | 'a' | 'r' | 'n' };

export type Car = {
  // identity
  id: number;
  finnCode: string;
  // basics
  brand: string;
  title: string;
  sub: string;
  year: number;
  km: number;
  location: string;
  // money
  price: number;
  estSell: number;
  margin: number;
  omreg: number;
  klargjoring: number;
  // scores
  score: number;
  dealScore: number;          // overwritten with composite total (see scoring.ts)
  prisVsMarkedScore: number;  // raw scraper dealScore (kept for the pris-vs-marked bar)
  bars: Bars;                 // four-bar breakdown shown on the detail page
  anbefaling: 'KJØP' | 'VURDER' | 'SKIP' | null;
  confidence: 'high' | 'medium' | 'low' | null;
  compConfidence: 'high' | 'medium' | 'low' | null;
  compCount: number | null;
  compSpreadPct: number | null;
  // markedet (analyst view)
  ai: string;
  aiUsikkerhet: string | null;
  aiViktigsteRisiko: string | null;
  bucketMedianPrivate: number | null;
  bucketMedianDealer: number | null;
  bucketP25Private: number | null;
  lowballTarget: number | null;
  lowballMargin: number | null;
  medianMargin: number | null;
  valuationSource: string | null;
  // history
  priceHistory: number[];
  priceChange: number;
  priceDrops: number;
  daysListed: string;
  daysListedRaw: number;
  // seller
  sellerClass: 'Privat' | 'Trolig privat' | 'Forhandler' | 'Verksted/skade' | 'Uavklart';
  sellerType: string;
  // narrative
  reasons: string[];
  negotiation: string[];
  damageFlags: string[];
  duplicateCount: number;
  // raw tags (passed through for UI)
  tags: Tag[];
  badge: 'NY' | 'PRIS↓' | 'HOT' | null;
  // images: ordered list from finn.no detail page (first = primary).
  // Empty array = no images known yet (frontend falls back to placeholder).
  images: string[];
  // placeholder fields — not in scraper data yet
  img: string | null;
  drivetrain: string | null;
  battery: string | null;
  rangeKm: number | null;
  fuel: string | null;
};

const sellerClassMap: Record<string, Car['sellerClass']> = {
  private: 'Privat',
  private_likely: 'Trolig privat',
  dealer: 'Forhandler',
  body_shop: 'Verksted/skade',
  unknown: 'Uavklart',
};

const tagToneFromColor = (c?: string): Tag['tone'] => {
  if (c === 'g') return 'g';
  if (c === 'b') return 'b';
  if (c === 'a') return 'a';
  if (c === 'r') return 'r';
  return 'n';
};

export function mapCar(raw: RawCar): Car {
  const tags: Tag[] = (raw.tags || []).map((t) => ({
    label: t.t,
    tone: tagToneFromColor(t.c),
  }));
  let badge: Car['badge'] = null;
  if (raw.anbefaling === 'KJØP') badge = 'HOT';
  else if (raw.priceDrops && raw.priceDrops > 0) badge = 'PRIS↓';
  else if (raw.dagerRaw !== undefined && raw.dagerRaw <= 1) badge = 'NY';

  // Composite scoring: bars.total replaces dealScore everywhere in the UI.
  // The "Pris vs marked" bar carries the original scraper dealScore.
  const bars = computeBars({
    pris: raw.pris,
    gevinst: raw.gevinst,
    salgspris: raw.salgspris,
    omreg: raw.omreg,
    klargjoring: raw.klargjoring,
    medianMargin: raw.medianMargin ?? null,
    compConfidence: raw.compConfidence ?? null,
    damageFlags: raw.damageFlags || [],
    dealScore: raw.dealScore ?? raw.score,
    score: raw.score,
  });

  return {
    id: raw.id,
    finnCode: raw.finn,
    brand: raw.merke,
    title: raw.tittel,
    sub: raw.sub || '',
    year: raw.aar,
    km: raw.km,
    location: raw.lok,
    price: raw.pris,
    estSell: raw.salgspris,
    margin: raw.gevinst,
    omreg: raw.omreg ?? 5600,
    klargjoring: raw.klargjoring ?? 8500,
    score: raw.score,
    dealScore: bars.total,
    prisVsMarkedScore: bars.prisVsMarked,
    bars,
    anbefaling: (raw.anbefaling as Car['anbefaling']) || null,
    confidence: raw.confidence ?? null,
    compConfidence: raw.compConfidence ?? null,
    compCount: raw.compCount ?? null,
    compSpreadPct: raw.compSpreadPct ?? null,
    ai: raw.ai || '',
    aiUsikkerhet: raw.aiUsikkerhet ?? null,
    aiViktigsteRisiko: raw.aiViktigsteRisiko ?? null,
    bucketMedianPrivate: raw.bucketMedianPrivate ?? null,
    bucketMedianDealer: raw.bucketMedianDealer ?? null,
    bucketP25Private: raw.bucketP25Private ?? null,
    lowballTarget: raw.lowballTarget ?? null,
    lowballMargin: raw.lowballMargin ?? null,
    medianMargin: raw.medianMargin ?? null,
    valuationSource: raw.valuationSource ?? null,
    priceHistory: raw.prisData || [raw.pris],
    priceChange: raw.prisEndring ?? 0,
    priceDrops: raw.priceDrops ?? 0,
    daysListed: raw.dager || '',
    daysListedRaw: raw.dagerRaw ?? 0,
    sellerClass: sellerClassMap[raw.selgerKlasse || 'unknown'] || 'Uavklart',
    sellerType: raw.selgerType || '',
    reasons: raw.reasons || [],
    negotiation: raw.negotiation || [],
    damageFlags: raw.damageFlags || [],
    duplicateCount: raw.duplicateCount ?? 0,
    tags,
    badge,
    // Images come from the post-scraper enrichment script (scripts/fetch-images.mjs).
    images: Array.isArray(raw.images) ? raw.images : [],
    // Legacy single-image field; kept null because all UI now reads `images[0]`.
    img: null,
    // TODO(specs): scraper does not yet supply drivetrain/battery/range; left null.
    drivetrain: null,
    battery: null,
    rangeKm: null,
    fuel: raw.drivstoff || null,
  };
}

export function valuationSourceLabel(v: string | null): string {
  if (!v) return 'Modellestimat';
  const map: Record<string, string> = {
    comps_private: 'Private komper',
    comps_private_fallback: 'Private komper (fallback)',
    comps_dealer: 'Forhandlerkomper',
    comps_dealer_fallback: 'Dealer-komper som gulv',
    comps_mixed: 'Miks av komper',
    ai_fallback: 'AI-estimat',
    naive_fallback: 'Enkel tommelfingerregel',
  };
  return map[v] || 'Modellestimat';
}

export function anbefalingLabel(a: Car['anbefaling']): { label: string; tone: 'g' | 'b' | 'r' } | null {
  if (!a) return null;
  if (a === 'KJØP') return { label: 'Anbefalt kjøp', tone: 'g' };
  if (a === 'VURDER') return { label: 'Vurder', tone: 'b' };
  if (a === 'SKIP') return { label: 'Skip', tone: 'r' };
  return null;
}
