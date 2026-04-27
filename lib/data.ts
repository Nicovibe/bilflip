/**
 * Server-side loaders for car data. These read directly from the data/ folder
 * on disk — works during dev and on Vercel because data/ is committed to the repo.
 *
 * Client components fetch /data/biler.json instead (copied to public/data/ at build).
 */
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { mapCar, type Car, type RawCar } from './mapping';

const DATA_DIR = path.join(process.cwd(), 'data');

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[data] could not read ${file}:`, (err as Error).message);
    return fallback;
  }
}

/**
 * images-cache.json shape (written by scripts/fetch-images.mjs):
 *   { [finnCode: string]: { urls: string[]; fetchedAt: number; status: number } }
 * Kept as a separate file so we never have to mutate scraper output (biler.json
 * is owned by ~/projects/bilflip-scraper and we promised to leave it alone).
 */
type ImageCacheEntry = { urls?: string[]; fetchedAt?: number; status?: number };
type ImageCache = Record<string, ImageCacheEntry | undefined>;

async function loadImageCache(): Promise<ImageCache> {
  return readJson<ImageCache>('images-cache.json', {});
}

export async function loadCars(): Promise<Car[]> {
  const [raw, imageCache] = await Promise.all([
    readJson<RawCar[]>('biler.json', []),
    loadImageCache(),
  ]);
  return raw.map((r) => {
    // Prefer images straight from biler.json (set by scraper detail.js as of
    // the image-scraping rework). Fall back to images-cache.json for any car
    // that hasn't been re-scraped yet — keeps the legacy cache useful during
    // the transition.
    const fromScraper = Array.isArray(r.images) ? (r.images as string[]) : null;
    const finn = r.finn != null ? String(r.finn) : '';
    const entry = finn ? imageCache[finn] : undefined;
    const fromCache = Array.isArray(entry?.urls) ? entry.urls : [];
    const images = fromScraper && fromScraper.length > 0 ? fromScraper : fromCache;
    return mapCar({ ...r, images });
  });
}

export async function loadCar(finnCode: string): Promise<Car | null> {
  const cars = await loadCars();
  return cars.find((c) => c.finnCode === finnCode) || null;
}

export type Feeds = {
  hot: RawCar[];
  review: RawCar[];
  dealer_picks: RawCar[];
  generated_at?: string;
};

export async function loadFeeds(): Promise<{ hot: Car[]; review: Car[]; dealerPicks: Car[]; generatedAt: string | null }> {
  const [f, imageCache] = await Promise.all([
    readJson<Feeds | null>('feeds.json', null),
    loadImageCache(),
  ]);
  if (!f) return { hot: [], review: [], dealerPicks: [], generatedAt: null };
  const enrich = (r: RawCar) => {
    const fromScraper = Array.isArray(r.images) ? (r.images as string[]) : null;
    const finn = r.finn != null ? String(r.finn) : '';
    const entry = finn ? imageCache[finn] : undefined;
    const fromCache = Array.isArray(entry?.urls) ? entry.urls : [];
    const images = fromScraper && fromScraper.length > 0 ? fromScraper : fromCache;
    return mapCar({ ...r, images });
  };
  return {
    hot: (f.hot || []).map(enrich),
    review: (f.review || []).map(enrich),
    dealerPicks: (f.dealer_picks || []).map(enrich),
    generatedAt: f.generated_at || null,
  };
}

export type SiteStats = {
  scannedToday: number;
  totalScanned: number;
  avgMargin: number;
  bestMargin: number;
  bestCarTitle: string;
  bestCarLocation: string;
  uniqueBrands: number;
};

export async function loadStats(): Promise<SiteStats> {
  const cars = await loadCars();
  if (cars.length === 0) {
    return {
      scannedToday: 0,
      totalScanned: 0,
      avgMargin: 0,
      bestMargin: 0,
      bestCarTitle: '–',
      bestCarLocation: '–',
      uniqueBrands: 0,
    };
  }
  const todayCars = cars.filter((c) => c.daysListedRaw <= 1);
  const margins = cars.map((c) => c.margin);
  const avg = Math.round(margins.reduce((a, b) => a + b, 0) / margins.length);
  const sorted = [...cars].sort((a, b) => b.margin - a.margin);
  const best = sorted[0];
  const brands = new Set(cars.map((c) => c.brand));
  return {
    scannedToday: todayCars.length || cars.length,
    totalScanned: cars.length,
    avgMargin: avg,
    bestMargin: best.margin,
    bestCarTitle: best.title,
    bestCarLocation: best.location,
    uniqueBrands: brands.size,
  };
}
