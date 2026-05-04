/**
 * POST /api/favorites/import — one-shot bulk import.
 *
 * Body: { finnKodes: string[] }
 *
 * Used by the favorites hook on first authed visit to push the user's old
 * localStorage IDs to the server, after which the hook clears localStorage.
 * Idempotent: each row is upserted with onConflictDoNothing.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { favorites } from '@/lib/db/schema';

export const runtime = 'nodejs';

const MAX_IMPORT = 500; // sanity cap — nobody has 500+ favorites

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { finnKodes?: unknown }
    | null;
  const codes = Array.isArray(body?.finnKodes)
    ? body!.finnKodes
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
        .slice(0, MAX_IMPORT)
    : [];
  if (codes.length === 0) {
    return NextResponse.json({ ok: true, imported: 0 });
  }
  await db
    .insert(favorites)
    .values(codes.map((finnKode) => ({ userId: session.user.id, finnKode })))
    .onConflictDoNothing();
  return NextResponse.json({ ok: true, imported: codes.length });
}
