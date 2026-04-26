'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthed } from '@/lib/auth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthed()) {
      setReady(true);
    } else {
      const next = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?next=${next}`);
    }
  }, [router, pathname]);

  if (!ready) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Verifiserer tilgang…
      </div>
    );
  }
  return <>{children}</>;
}
