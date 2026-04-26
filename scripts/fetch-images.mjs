// Enriches biler.json with finn.no image URLs.
//
// Why this exists: the scraper repo (~/projects/bilflip-scraper) is intentionally
// untouched. We hotlink finn-CDN images via Next.js Image Optimization, with a
// committed cache (data/images-cache.json) so repeated builds don't refetch.
//
// Pipeline (runs in prebuild after copy-data.mjs):
//   1. Read public/data/biler.json     (the cars to enrich)
//   2. Read data/images-cache.json     (committed cache; survives across builds)
//   3. For every finn-code missing/expired in cache: fetch finn.no detail page,
//      parse image UUIDs, build CDN URLs.
//   4. Write the augmented public/data/biler.json (adds `images: string[]`).
//   5. Write public/data/images-cache.json (always; reflects current state).
//   6. With --commit (only locally): also write data/images-cache.json so
//      `git commit` picks up the new entries for next build.
//
// Run modes:
//   node scripts/fetch-images.mjs              ← build mode, no commit
//   node scripts/fetch-images.mjs --commit     ← local refresh, writes data/

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const PUBLIC_BILER  = 'public/data/biler.json';
const PUBLIC_CACHE  = 'public/data/images-cache.json';
const REPO_CACHE    = 'data/images-cache.json';
const SOURCE_OF_TRUTH_CACHE = REPO_CACHE; // committed; preferred when present

const COMMIT = process.argv.includes('--commit');
const FORCE  = process.argv.includes('--force');           // ignore cache TTL
const FORCE_REFETCH_EMPTY = process.argv.includes('--retry-empty'); // re-try entries that returned 0 images
const CACHE_TTL_DAYS = 30;
const CACHE_TTL_MS   = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
const CONCURRENCY    = 8;
const REQUEST_TIMEOUT_MS = 15_000;
const RETRIES = 2;

// Browser UA so finn.no doesn't 403 us.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function readJSON(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(await readFile(path, 'utf8'));
}

function buildUrl(finn, uuid) {
  // `default` is finn's name for the original/largest variant. Next.js Image
  // will downscale to the requested width.
  return `https://images.finncdn.no/dynamic/default/item/${finn}/${uuid}`;
}

/**
 * Parse a finn detail-page HTML and return the ordered list of image URLs.
 * - We match the og:image first to anchor the primary photo.
 * - Then we collect all images.finncdn.no/.../item/{finn}/{uuid} occurrences
 *   in DOM order, deduping by UUID. Verified in Fase 0: og:image == ordered[0].
 */
function parseImagesFromHtml(html, finn) {
  const codeEsc = String(finn).replace(/[^0-9]/g, '');
  if (!codeEsc) return [];
  const re = new RegExp(`images\\.finncdn\\.no\\/dynamic\\/[^\\/"']+\\/item\\/${codeEsc}\\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})`, 'g');
  const seen = new Set();
  const ordered = [];
  for (const m of html.matchAll(re)) {
    const u = m[1];
    if (!seen.has(u)) { seen.add(u); ordered.push(u); }
  }
  return ordered.map((uuid) => buildUrl(codeEsc, uuid));
}

async function fetchWithTimeout(url, init) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Fetch one detail page; returns { urls, status }. */
async function fetchOne(finn) {
  const url = `https://www.finn.no/mobility/item/${finn}`;
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nb,no;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
      });
      if (res.status === 404 || res.status === 410) {
        return { urls: [], status: res.status };
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const html = await res.text();
      const urls = parseImagesFromHtml(html, finn);
      return { urls, status: 200 };
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  return { urls: [], status: 0, error: String(lastErr?.message || lastErr) };
}

/** Limited-concurrency map. */
async function pMap(items, mapper, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  let done = 0;
  let lastLog = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        results[i] = await mapper(items[i], i);
        done++;
        const now = Date.now();
        if (now - lastLog > 1500 || done === items.length) {
          lastLog = now;
          process.stdout.write(`[fetch-images] progress ${done}/${items.length}\n`);
        }
      }
    }),
  );
  return results;
}

function isFresh(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (FORCE) return false;
  if (FORCE_REFETCH_EMPTY && Array.isArray(entry.urls) && entry.urls.length === 0) return false;
  if (typeof entry.fetchedAt !== 'number') return false;
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

async function main() {
  if (!existsSync(PUBLIC_BILER)) {
    console.warn(`[fetch-images] ${PUBLIC_BILER} not found — run copy-data first. Skipping.`);
    process.exit(0);
  }
  const cars = await readJSON(PUBLIC_BILER, []);
  if (!Array.isArray(cars) || cars.length === 0) {
    console.warn('[fetch-images] biler.json is empty — nothing to enrich.');
    process.exit(0);
  }

  // Cache lineage: prefer the committed file in /data, fall back to /public.
  const repoCache   = await readJSON(REPO_CACHE, {});
  const publicCache = await readJSON(PUBLIC_CACHE, {});
  const cache = { ...publicCache, ...repoCache }; // repo wins (it's the source of truth)

  const todo = [];
  for (const c of cars) {
    const finn = c.finn != null ? String(c.finn) : '';
    if (!finn) continue;
    if (!isFresh(cache[finn])) todo.push(finn);
  }

  console.log(`[fetch-images] ${cars.length} cars total, ${Object.keys(cache).length} in cache, ${todo.length} to fetch`);

  if (todo.length > 0) {
    const t0 = Date.now();
    const results = await pMap(todo, async (finn) => ({ finn, ...(await fetchOne(finn)) }), CONCURRENCY);
    let ok = 0, empty = 0, gone = 0, fail = 0;
    for (const r of results) {
      cache[r.finn] = { urls: r.urls, fetchedAt: Date.now(), status: r.status };
      if (r.error) cache[r.finn].error = r.error;
      if (r.status === 200 && r.urls.length > 0) ok++;
      else if (r.status === 200) empty++;
      else if (r.status === 404 || r.status === 410) gone++;
      else fail++;
    }
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[fetch-images] fetched in ${dt}s: ok=${ok} empty=${empty} gone=${gone} fail=${fail}`);
  }

  // Augment cars with images[] (in scraper-data order).
  const augmented = cars.map((c) => {
    const finn = c.finn != null ? String(c.finn) : '';
    const entry = finn ? cache[finn] : null;
    return { ...c, images: Array.isArray(entry?.urls) ? entry.urls : [] };
  });

  await mkdir('public/data', { recursive: true });
  await writeFile(PUBLIC_BILER, JSON.stringify(augmented));
  await writeFile(PUBLIC_CACHE, JSON.stringify(cache, null, 2));

  if (COMMIT) {
    await mkdir('data', { recursive: true });
    await writeFile(REPO_CACHE, JSON.stringify(cache, null, 2));
    console.log(`[fetch-images] wrote ${REPO_CACHE} (${Object.keys(cache).length} entries) — commit this file`);
  }

  const totalImgs = augmented.reduce((s, c) => s + (c.images?.length || 0), 0);
  const carsWithImgs = augmented.filter((c) => c.images?.length > 0).length;
  console.log(`[fetch-images] done: ${carsWithImgs}/${augmented.length} cars have images, ${totalImgs} total image URLs`);
}

main().catch((err) => {
  console.error('[fetch-images] FAILED:', err);
  // Don't fail the build over images. The frontend gracefully falls back to
  // the placeholder when c.images is empty.
  process.exit(0);
});
