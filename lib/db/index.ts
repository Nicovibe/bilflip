/**
 * Drizzle client for Neon Postgres over HTTP (works in Node + Edge runtimes).
 *
 * Each query is a one-shot HTTP request — there is no persistent connection
 * to drain. That makes it safe in Vercel serverless / edge functions, but it
 * also means batched queries should use db.transaction() so they share a
 * single round-trip.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use a placeholder if missing so module load (and `next build`) don't crash
// before envs are wired. Real queries will fail with a Neon error, which is
// what we want — the missing-env state should be visible at runtime, not at
// build time.
const url =
  process.env.DATABASE_URL ?? 'postgresql://missing:missing@localhost/missing';

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[db] DATABASE_URL is not set — DB queries will fail. See .env.example.',
  );
}

const sql = neon(url);
export const db = drizzle(sql, { schema });
export { schema };
