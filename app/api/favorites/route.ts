/**
 * /api/favorites — server-side favorites store.
 *
 *   GET    → string[] of finn-codes the current user has starred
 *   POST   { finnKode }  → add (idempotent — onConflictDoNothing)
 *   DELETE { finnKode }  → remove
 *
 * All routes require an authenticated session. The middleware doesn't gate
 * /api/* paths (we let it through), so we do the auth check here.
 */
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { favorites } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rows = await db
    .select({ finnKode: favorites.finnKode })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id));
  return NextResponse.json(rows.map((r) => r.finnKode));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { finnKode?: string } | null;
  const finnKode = body?.finnKode;
  if (!finnKode || typeof finnKode !== 'string') {
    return NextResponse.json({ error: 'invalid-finnKode' }, { status: 400 });
  }
  await db
    .insert(favorites)
    .values({ userId: session.user.id, finnKode })
    .onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { finnKode?: string } | null;
  const finnKode = body?.finnKode;
  if (!finnKode || typeof finnKode !== 'string') {
    return NextResponse.json({ error: 'invalid-finnKode' }, { status: 400 });
  }
  await db
    .delete(favorites)
    .where(
      and(eq(favorites.userId, session.user.id), eq(favorites.finnKode, finnKode)),
    );
  return NextResponse.json({ ok: true });
}
