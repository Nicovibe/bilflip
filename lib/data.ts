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

export async function loadCars(): Promise<Car[]> {
  const raw = await readJson<RawCar[]>('biler.json', []);
  return raw.map(mapCar);
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
  const f = await readJson<Feeds | null>('feeds.json', null);
  if (!f) return { hot: [], review: [], dealerPicks: [], generatedAt: null };
  return {
    hot: (f.hot || []).map(mapCar),
    review: (f.review || []).map(mapCar),
    dealerPicks: (f.dealer_picks || []).map(mapCar),
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
