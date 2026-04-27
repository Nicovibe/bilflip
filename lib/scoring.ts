/**
 * Composite score for a car. The four bars shown in the AI-analyse card
 * average together to form the overall score that's displayed everywhere
 * (table badge, detail page, sort key). What the user sees IS what they get.
 *
 * Bars:
 *   1. Margin           — gevinst as % of price (the strongest flip signal)
 *   2. Comp-tillit      — confidence in comparable data
 *   3. Tilstand         — damage-flag gate
 *   4. Pris vs marked   — the scraper's existing dealScore
 *
 * Total = unweighted mean of the four. If you want to re-weight later,
 * change `total` below — everything else flows from there.
 */

type BarsInput = {
  pris?: number;
  gevinst?: number | null;
  salgspris?: number;
  omreg?: number;
  klargjoring?: number;
  medianMargin?: number | null;
  compConfidence?: 'high' | 'medium' | 'low' | null;
  damageFlags?: string[];
  dealScore?: number;
  score?: number;
};

export type Bars = {
  margin: number;        // 0–100 score from gevinst%
  comp: number;          // 0–100 score from compConfidence
  tilstand: number;      // 0–100 score from damageFlags
  prisVsMarked: number;  // 0–100 score from scraper dealScore
  marginPct: number;     // raw gevinst-as-percent-of-price (for display)
  marginNok: number;     // raw gevinst in NOK (for display, when needed)
  total: number;         // 0–100 mean of the four
};

/**
 * Piecewise mapping from gevinst-as-percent-of-price to a 0–100 score.
 * Calibrated so a "decent flip" (10%) sits at 50 and an "extreme flip"
 * (50%+) saturates near 100.
 *
 *   pct ≤ 0   → 0
 *   pct = 10  → 50
 *   pct = 25  → 80
 *   pct = 50  → 95
 *   pct ≥ 50  → 95 + slow drift toward 100
 */
function marginScoreFromPct(pct: number): number {
  if (pct <= 0) return 0;
  if (pct >= 50) return Math.min(100, 95 + (pct - 50) / 10);
  if (pct >= 25) return 80 + ((pct - 25) / 25) * 15;
  if (pct >= 10) return 50 + ((pct - 10) / 15) * 30;
  return (pct / 10) * 50;
}

function compScore(c?: 'high' | 'medium' | 'low' | null): number {
  if (c === 'high') return 90;
  if (c === 'medium') return 65;
  if (c === 'low') return 40;
  return 50;
}

function tilstandScore(damageFlags?: string[]): number {
  return (damageFlags?.length ?? 0) === 0 ? 84 : 40;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function computeBars(i: BarsInput): Bars {
  const pris = i.pris ?? 0;

  // Margin fallback chain: gevinst → derived from salgspris → medianMargin → 0
  let gevinst = i.gevinst ?? null;
  if (gevinst == null && i.salgspris != null && pris > 0) {
    gevinst = i.salgspris - pris - (i.omreg ?? 0) - (i.klargjoring ?? 0);
  }
  if (gevinst == null) gevinst = i.medianMargin ?? 0;

  const marginPct = pris > 0 ? (gevinst / pris) * 100 : 0;
  const margin = clamp(Math.round(marginScoreFromPct(marginPct)));
  const comp = compScore(i.compConfidence);
  const tilstand = tilstandScore(i.damageFlags);
  const prisVsMarked = clamp(Math.round(i.dealScore ?? i.score ?? 50));
  const total = clamp(Math.round((margin + comp + tilstand + prisVsMarked) / 4));

  return {
    margin,
    comp,
    tilstand,
    prisVsMarked,
    marginPct: Math.round(marginPct * 10) / 10,
    marginNok: Math.round(gevinst),
    total,
  };
}
