// Copies data/*.json (where the scraper publishes) into public/data/
// so Next.js serves them at /data/biler.json etc. — same URL as the legacy site.
// Runs as predev and prebuild; safe to run when data/ doesn't exist yet.
import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const src = 'data';
const dst = 'public/data';

if (!existsSync(src)) {
  console.warn(`[copy-data] Source dir "${src}" not found — skipping.`);
  process.exit(0);
}

await rm(dst, { recursive: true, force: true });
await mkdir(dst, { recursive: true });
await cp(src, dst, { recursive: true });
console.log(`[copy-data] ${src}/ → ${dst}/ ✓`);
