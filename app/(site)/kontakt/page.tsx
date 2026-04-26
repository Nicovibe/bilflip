import { ContactForm } from '@/components/ContactForm';

export const metadata = {
  title: 'Kontakt bilvipp',
  description: 'Spørsmål? Vi svarer normalt innen 2 timer på hverdager.',
};

export default function KontaktPage() {
  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ KONTAKT</div>
          <div className="subhead-title">
            Spørsmål? <em>Vi svarer.</em>
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          SVARTID: ~2t HVERDAGER
        </span>
      </div>
      <div className="section-tx">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <p className="lede">
              Vi svarer normalt innen 2 timer på hverdager. Booking av demo? Bruk skjemaet — vi sender Calendly-link.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 32 }}>
              <div className="tx-card">
                <div className="tx-card-h">
                  <h4>E-POST</h4>
                </div>
                <a href="mailto:hei@bilvipp.no" style={{ fontSize: 18, fontWeight: 600 }}>
                  hei@bilvipp.no
                </a>
              </div>
              <div className="tx-card">
                <div className="tx-card-h">
                  <h4>BESØKSADRESSE</h4>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Karenslyst Allé 53
                  <br />
                  0279 Oslo
                </div>
              </div>
              <div className="tx-card">
                <div className="tx-card-h">
                  <h4>SOSIALT</h4>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                  Telegram-kanal og X-konto kommer i Q2. Følg med på utviklingen.
                </p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
