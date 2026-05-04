'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

function LoginForm() {
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';
  const checkEmail = search.get('check') === 'email';
  const errored = search.get('error');
  const paywall = search.get('paywall') === '1';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      // Auth.js will set the verification token, send the email via Resend,
      // and redirect to /login?check=email on success.
      await signIn('resend', { email, redirectTo: next });
    } catch (e) {
      setErr('Kunne ikke sende lenke. Prøv igjen.');
      setSubmitting(false);
    }
  }

  // Confirmation screen — Auth.js redirects here after the email is dispatched.
  if (checkEmail) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <Link href="/" className="login-brand">
            <span className="brand-mark">b</span>
            <span>
              bil<em style={{ color: 'var(--green)', fontStyle: 'normal' }}>vipp</em>
            </span>
          </Link>
          <h1 className="login-h">Sjekk e-posten</h1>
          <p className="login-sub">
            Vi har sendt deg en innloggingslenke. Klikk lenken for å fullføre innloggingen.
            <br />
            Lenken er gyldig i 24 timer.
          </p>
          <div className="login-footer" style={{ marginTop: 24 }}>
            Fant du ikke e-posten? Sjekk søppelpost, eller{' '}
            <Link href="/login">prøv på nytt</Link>.
          </div>
        </div>
      </div>
    );
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
          {paywall
            ? 'Du må ha aktivt abonnement for å se denne siden. Logg inn først, eller velg en plan.'
            : 'Få tilgang til dashboard, bildetalj og fulle analyser.'}
          <br />
          14 dager gratis Pro · ingen binding.
        </p>

        <form onSubmit={onSubmit}>
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
              disabled={submitting}
            />
          </div>
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            disabled={submitting || !email}
          >
            {submitting ? 'Sender lenke…' : 'Send magic link →'}
          </button>
        </form>

        {(err || errored) && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              fontSize: 13,
            }}
          >
            {err ?? 'Noe gikk galt under innlogging. Prøv igjen.'}
          </div>
        )}

        <div className="login-footer" style={{ marginTop: 32 }}>
          Trenger du hjelp? <Link href="/kontakt">Skriv til oss →</Link>
          <br />
          Vipps Login kommer snart.
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
