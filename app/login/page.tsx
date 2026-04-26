'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';
  const [email, setEmail] = useState('');

  function go() {
    signIn();
    router.replace(next);
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <Link href="/" className="login-brand">
          <span className="brand-mark">b</span>
          <span>
            bil<em style={{ color: 'var(--green)', fontStyle: 'normal' }}>vipp</em>
          </span>
        </Link>
        <h1 className="login-h">Logg inn</h1>
        <p className="login-sub">
          Få tilgang til dashboard, bildetalj og fulle analyser.
          <br />
          14 dager gratis · ingen binding.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <div className="field-tx">
            <label htmlFor="login-email">E-post</label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="navn@firma.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
          >
            Send magic link →
          </button>
        </form>

        <div className="login-or">
          <div className="login-or-line" />
          <span className="login-or-t">eller</span>
          <div className="login-or-line" />
        </div>

        <button
          type="button"
          className="btn btn-vipps btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          onClick={go}
        >
          Logg inn med Vipps
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={go}
        >
          Logg inn som demo
        </button>

        <div className="login-mock-note">
          <strong style={{ color: 'var(--gold)' }}>MOCK · DEMO</strong>
          <br />
          Ingen ekte autentisering enda. Demo-knappen setter et lokalt flagg som låser
          opp dashboard og bildetalj. Vipps Login og e-post magic link kommer i v2.1.
        </div>

        <div className="login-footer">
          Trenger du hjelp? <Link href="/kontakt">Skriv til oss →</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-shell">Laster…</div>}>
      <LoginForm />
    </Suspense>
  );
}
