'use client';
import { useState } from 'react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Generelt spørsmål');
  const [message, setMessage] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(api): replace with real POST endpoint when backend is ready
    const subject = encodeURIComponent(`[bilvipp] ${topic} — ${name}`);
    const body = encodeURIComponent(`Fra: ${name} <${email}>\nEmne: ${topic}\n\n${message}`);
    window.location.href = `mailto:hei@bilvipp.no?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="tx-card" style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--green-bg)',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              margin: '0 auto 14px',
            }}
            aria-hidden
          >
            ✓
          </div>
          <h3 className="h-2">Takk for henvendelsen.</h3>
          <p style={{ color: 'var(--ink-2)', marginTop: 8, fontSize: 13 }}>
            E-postklienten din skal være åpnet. Vi tar kontakt innen 2 timer på hverdager.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-card" style={{ padding: 24 }}>
      <form onSubmit={onSubmit}>
        <div className="tx-card-h">
          <h4>NY HENVENDELSE</h4>
          <span className="badge-on">SECURE</span>
        </div>
        <div className="field-tx">
          <label htmlFor="cf-navn">Navn</label>
          <input
            id="cf-navn"
            required
            placeholder="Fornavn Etternavn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="field-tx">
          <label htmlFor="cf-epost">E-post</label>
          <input
            id="cf-epost"
            type="email"
            required
            placeholder="navn@firma.no"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="field-tx">
          <label htmlFor="cf-tema">Hva gjelder det?</label>
          <select id="cf-tema" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option>Generelt spørsmål</option>
            <option>Booking av demo</option>
            <option>Trader-plan / API</option>
            <option>Presse</option>
          </select>
        </div>
        <div className="field-tx">
          <label htmlFor="cf-melding">Melding</label>
          <textarea
            id="cf-melding"
            rows={4}
            placeholder="Skriv her…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          type="submit"
        >
          Send melding →
        </button>
      </form>
    </div>
  );
}
