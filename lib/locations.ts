/**
 * City → coordinate lookup for the Norway map on /bil/[id].
 *
 * Coordinates are projected to SVG via projectLatLng() in lib/norway-shape,
 * which uses the same cosine-corrected equirectangular projection that the
 * Natural Earth-derived NORWAY_PATH was generated with — so a city's dot
 * lands exactly on the country outline.
 *
 * Anything not in CITY_COORDS falls back to Oslo so the dot still renders.
 * Add cities as the dataset grows; lat/lng can be eyeballed from Wikipedia.
 */

import { projectLatLng } from './norway-shape';

export type LatLng = readonly [number, number];

/**
 * Curated lookup. Keys are normalised lowercase. Includes the common forms
 * the scraper produces (e.g. "Kristiansand S" with the trailing 'S' is a
 * finn artefact; we just key off "kristiansand").
 */
export const CITY_COORDS: Record<string, LatLng> = {
  // Eastern Norway (Oslofjord region — most listings)
  oslo: [59.91, 10.75],
  asker: [59.83, 10.43],
  bærum: [59.89, 10.52],
  rud: [59.91, 10.51],
  drammen: [59.74, 10.2],
  lierstranda: [59.78, 10.3],
  mjøndalen: [59.75, 10.02],
  ski: [59.72, 10.83],
  ås: [59.66, 10.79],
  drøbak: [59.66, 10.63],
  åros: [59.65, 10.59],
  lørenskog: [59.93, 10.95],
  lillestrøm: [59.96, 11.05],
  skedsmokorset: [60.0, 11.04],
  jessheim: [60.14, 11.18],
  kløfta: [60.07, 11.14],
  gardermoen: [60.2, 11.1],
  eidsvoll: [60.33, 11.27],
  råholt: [60.31, 11.21],
  fredrikstad: [59.22, 10.93],
  sarpsborg: [59.28, 11.11],
  halden: [59.12, 11.39],
  tistedal: [59.13, 11.43],
  moss: [59.43, 10.66],
  mysen: [59.55, 11.32],
  askim: [59.58, 11.16],
  hønefoss: [60.17, 10.26],

  // Inland east
  hamar: [60.79, 11.07],
  løten: [60.83, 11.34],
  elverum: [60.88, 11.56],
  kongsvinger: [60.19, 11.99],
  lillehammer: [61.11, 10.47],
  gjøvik: [60.79, 10.69],
  hunndalen: [60.76, 10.66],

  // Vestfold / Telemark
  tønsberg: [59.27, 10.41],
  sandefjord: [59.13, 10.22],
  torp: [59.18, 10.26],
  larvik: [59.05, 10.04],
  porsgrunn: [59.14, 9.66],
  skien: [59.21, 9.61],
  notodden: [59.56, 9.26],
  ulefoss: [59.3, 9.27],

  // Sørlandet
  kristiansand: [58.15, 7.99],
  arendal: [58.46, 8.77],

  // Western Norway
  stavanger: [58.97, 5.73],
  sandnes: [58.85, 5.74],
  haugesund: [59.41, 5.27],
  bergen: [60.39, 5.32],
  rådal: [60.27, 5.29],
  søreidgrend: [60.3, 5.27],
  nyborg: [60.46, 5.31],
  hjellestad: [60.27, 5.13],
  voss: [60.63, 6.41],

  // Møre og Romsdal
  ålesund: [62.47, 6.15],
  mauseidvåg: [62.5, 6.36],
  molde: [62.74, 7.16],
  kristiansund: [63.11, 7.73],

  // Trøndelag
  trondheim: [63.43, 10.39],
  orkanger: [63.31, 9.85],
  steinkjer: [64.01, 11.5],

  // Northern Norway
  bodø: [67.28, 14.41],
  'mo i rana': [66.32, 14.14],
  narvik: [68.44, 17.43],
  harstad: [68.8, 16.55],
  tromsø: [69.65, 18.96],
  alta: [69.97, 23.27],
  hammerfest: [70.66, 23.68],
  kirkenes: [69.73, 30.05],
};

/** Strip diacritic-stable noise like "Kristiansand S" trailing letters. */
function normaliseLocation(loc: string): string {
  let key = loc.trim().toLowerCase();
  // Common scraper artefacts where finn appends a letter for "Sør/Nord".
  key = key.replace(/\s+s$/, '').replace(/\s+n$/, '');
  // Try as-is first (handles "mo i rana"). Caller can also try a fallback.
  return key;
}

/** Look up coordinates by free-text location. Returns null if unknown. */
export function lookupCoords(location: string | null | undefined): LatLng | null {
  if (!location) return null;
  const key = normaliseLocation(location);
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Try first word ("Bergen Sentrum" → "bergen").
  const head = key.split(/\s+/)[0];
  if (head && CITY_COORDS[head]) return CITY_COORDS[head];
  return null;
}

/** Map a free-text location string to SVG coords (with Oslo fallback). */
export function locationToSvg(location: string | null | undefined): { x: number; y: number; matched: boolean } {
  const ll = lookupCoords(location);
  if (ll) {
    const { x, y } = projectLatLng(ll[0], ll[1]);
    return { x, y, matched: true };
  }
  // Fallback: Oslo. Better than no dot at all and stays on the country shape.
  const { x, y } = projectLatLng(59.91, 10.75);
  return { x, y, matched: false };
}

/** Build a Google Maps "search" URL — opens the address/city in a new tab. */
export function googleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', Norge')}`;
}
