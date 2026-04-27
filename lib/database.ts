/**
 * Loaders for the public /database tab. Reads two scraper-published files:
 *
 *   data/database.json      — every car ever seen (aktiv | solgt | fjernet),
 *                             light fields only (no AI analysis).
 *   data/prishistorikk.json — { [finn]: [{ p, t }] } — price changes over time.
 *
 * Sold cars are kept (status='solgt') so the user can study historical pricing.
 */
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');

export type DatabaseRow = {
  finn: string;
  tittel: string;
  pris: number | null;
  km: number | null;
  aar: number | null;
  drivstoff: string | null;
  lokasjon: string;
  lenke: string;
  selgerType: string;
  status: 'aktiv' | 'solgt' | 'fjernet' | string;
  sistOppdatert: string | null;
  funnetDato: string | null;
  sistSett: string | null;
  changeCount: number;
  minPris: number | null;
  maxPris: number | null;
  spread: number;
};

export type PriceObservation = { p: number; t: string };
export type PriceHistory = Record<string, PriceObservation[] | undefined>;

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[database] could not read ${file}:`, (err as Error).message);
    return fallback;
  }
}

export async function loadDatabase(): Promise<DatabaseRow[]> {
  return readJson<DatabaseRow[]>('database.json', []);
}

export async function loadPriceHistory(): Promise<PriceHistory> {
  return readJson<PriceHistory>('prishistorikk.json', {});
}

export async function loadDatabaseRow(finn: string): Promise<{ row: DatabaseRow | null; history: PriceObservation[] }> {
  const [rows, history] = await Promise.all([loadDatabase(), loadPriceHistory()]);
  const row = rows.find((r) => r.finn === finn) || null;
  return { row, history: history[finn] || [] };
}

export type DatabaseStats = {
  total: number;
  aktiv: number;
  solgt: number;
  fjernet: number;
  withChanges: number;
};

export async function loadDatabaseStats(): Promise<DatabaseStats> {
  const rows = await loadDatabase();
  let aktiv = 0;
  let solgt = 0;
  let fjernet = 0;
  let withChanges = 0;
  for (const r of rows) {
    if (r.status === 'aktiv') aktiv++;
    else if (r.status === 'solgt') solgt++;
    else if (r.status === 'fjernet') fjernet++;
    if (r.changeCount > 0) withChanges++;
  }
  return { total: rows.length, aktiv, solgt, fjernet, withChanges };
}
