/**
 * drizzle-kit config — used by `npm run db:generate` / `db:push` / `db:studio`.
 *
 * Explicitly loads .env.local first (matches Next.js env precedence) so the
 * Neon URL pulled via `vercel env pull` is picked up. Falls back to .env so
 * CI / production scripts that set DATABASE_URL via that file still work.
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv(); // .env fallback
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
