import { requirePaid } from '@/lib/auth';

/**
 * Server-side gate. Middleware already redirects unauthenticated / unpaid
 * users at the edge — this is the defense-in-depth layer in case middleware
 * is bypassed (e.g. a future config matcher change). Cheap: just reads the
 * JWT cookie via auth().
 */
export const dynamic = 'force-dynamic';

export default async function GatedLayout({ children }: { children: React.ReactNode }) {
  await requirePaid();
  return <>{children}</>;
}
