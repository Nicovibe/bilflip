import Link from 'next/link';

export const metadata = {
  title: 'Abonnement — bilvipp',
  description: 'Velg plan. 14 dager gratis. Ingen binding.',
};

export default function AbonnementPage() {
  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ KONTO / PLANS</div>
          <div className="subhead-title">
            Velg plan — <em>14 dager gratis</em>
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          INGEN BINDING · BYTT NÅR DU VIL
        </span>
      </div>

      <div className="section-tx">
        <div className="tx-prices">
          <div className="tx-price-card">
            <div>
              <div className="tx-price-name">GRATIS</div>
              <div className="tx-price-amt mono" style={{ marginTop: 8 }}>
                0<span className="suf">KR / MND</span>
              </div>
              <div className="tx-price-desc" style={{ marginTop: 8 }}>
                For å teste markedet uten forpliktelse.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <div className="tx-feat">Topp 1 bil daglig</div>
              <div className="tx-feat">Daglig sammendrag på e-post</div>
              <div className="tx-feat muted">Telegram-varsler</div>
              <div className="tx-feat muted">Full kalkyle</div>
              <div className="tx-feat muted">Prishistorikk</div>
              <div className="tx-feat muted">API-tilgang</div>
            </div>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ justifyContent: 'center', marginTop: 'auto' }}
            >
              Velg Gratis
            </Link>
          </div>

          <div className="tx-price-card featured">
            <div className="tx-price-tag">ANBEFALT</div>
            <div>
              <div className="tx-price-name">PRO</div>
              <div className="tx-price-amt mono" style={{ marginTop: 8 }}>
                299<span className="suf">KR / MND</span>
              </div>
              <div className="tx-price-desc" style={{ marginTop: 8 }}>
                For aktive flippere — den vanligste planen.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <div className="tx-feat">Alle aktive biler daglig</div>
              <div className="tx-feat">
                Telegram-varsler i sanntid <span className="coming">BETA</span>
              </div>
              <div className="tx-feat">Full flipping-kalkyle</div>
              <div className="tx-feat">Prishistorikk &amp; analyse</div>
              <div className="tx-feat">
                Watchlist + prisalert <span className="coming">KOMMER</span>
              </div>
              <div className="tx-feat muted">API-tilgang</div>
            </div>
            <Link
              href="/login"
              className="btn btn-primary"
              style={{ justifyContent: 'center', marginTop: 'auto' }}
            >
              Start 14 dager gratis
            </Link>
          </div>

          <div className="tx-price-card">
            <div>
              <div className="tx-price-name">TRADER</div>
              <div className="tx-price-amt mono" style={{ marginTop: 8 }}>
                699<span className="suf">KR / MND</span>
              </div>
              <div className="tx-price-desc" style={{ marginTop: 8 }}>
                Profesjonelle — full automatisering &amp; API.
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <div className="tx-feat">Alt i Pro</div>
              <div className="tx-feat">Performance-modeller (AWD)</div>
              <div className="tx-feat">
                Full API-tilgang <span className="coming">Q3 2026</span>
              </div>
              <div className="tx-feat">Custom alert-regler</div>
              <div className="tx-feat">Prioritert support</div>
              <div className="tx-feat">Faktura mot org.nr</div>
            </div>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ justifyContent: 'center', marginTop: 'auto' }}
            >
              Velg Trader
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 80, maxWidth: 780 }}>
          <div className="section-h">
            <div className="left">
              <span className="num">/ FAQ</span>
              <h2 className="h-1">Vanlige spørsmål</h2>
            </div>
          </div>
          {[
            [
              'Hvordan estimeres markedssnittet?',
              'Vi bygger en sammenlignings-bucket per modell+årgang+drivlinje, og bruker median + p25/p75 fra både privatannonser og forhandlere på finn.no. Comp-confidence rapporteres per bil.',
            ],
            [
              'Hvor ofte oppdateres listen?',
              'Hver time for finn.no. Telegram-varsler kommer i beta — meld deg på via skjemaet på kontaktsiden.',
            ],
            [
              'Kan jeg avslutte når som helst?',
              'Ja. Logg inn → Konto → Avslutt. Ingen oppsigelsestid. Avslutter du i prøveperioden blir du aldri belastet.',
            ],
            [
              'Tar dere provisjon?',
              'Nei. Bilvipp er rent et analyseverktøy — vi er aldri part i transaksjonen.',
            ],
          ].map(([q, a]) => (
            <div key={q} style={{ padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="h-3" style={{ marginBottom: 8 }}>
                {q}
              </div>
              <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.55 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
