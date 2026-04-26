/**
 * Norwegian (nb-NO) number and currency formatters.
 * Uses non-breaking thousands separator like the rest of the site.
 */

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  // toLocaleString('nb-NO') gives e.g. "12 480" but uses regular spaces;
  // we keep regular spaces — Inter renders them well at this size.
  return Math.round(n).toLocaleString('nb-NO').replace(/,/g, ' ');
}

export function kr(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  return `${fmt(n)}\u00a0kr`; // non-breaking space before kr
}

export function pctSigned(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n}%`;
}
