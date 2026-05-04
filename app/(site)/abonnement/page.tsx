import Link from 'next/link';
import { auth } from '@/auth';
import { isEntitled } from '@/lib/plans';

export const metadata = {
  title: 'Abonnement — bilvipp',
  description: 'Velg plan. 14 dager gratis Pro. Ingen binding.',
};

export const dynamic = 'force-dynamic';

/**
 * Pricing page. CTAs POST to /api/billing/checkout for paid plans, which
 * redirects to Stripe Checkout. The Gratis CTA just bounces unauthenticated
 * visitors to /login (Gratis is the default after registration).
 */
export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ paywall?: string; canceled?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const paywallNotice = params.paywall === '1';
  const canceled = params.canceled === '1';
  const error = params.error;
  const isLoggedIn = !!session?.user?.id;
  const isPaid = isEntitled(session?.plan, session?.status);

  return (
    <>
      <div className="subhead">
        <div className="subhead-left">
          <div className="subhead-crumb">/ KONTO / PLANS</div>
          <div className="subhead-title">
            Velg plan — <em>14 dager gratis Pro</em>
          </div>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          INGEN BINDING · BYTT NÅR DU VIL
        </span>
      </div>

      {paywallNotice && (
        <div
          style={{
            margin: '16px 24px 0',
            padding: '12px 16px',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            fontSize: 13,
          }}
        >
          Den siden krever aktivt abonnement. Velg en plan under for å fortsette.
        </div>
      )}
      {canceled && (
        <div
          style={{
            margin: '16px 24px 0',
            padding: '12px 16px',
            border: '1px solid var(--ink-3)',
            color: 'var(--ink-2)',
            fontSize: 13,
          }}
        >
          Du avbrøt betalingen. Ingen belastning. Du kan prøve igjen når du vil.
        </div>
      )}
      {error && (
        <div
          style={{
            margin: '16px 24px 0',
            padding: '12px 16px',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            fontSize: 13,
          }}
        >
          Kunne ikke starte betalingen ({error}). Prøv igjen, eller kontakt
          support.
        </div>
      )}

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
            {isLoggedIn ? (
              <Link
                href="/markedet"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', marginTop: 'auto' }}
              >
                Til markedet →
              </Link>
            ) : (
              <Link
                href="/login?next=/markedet"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', marginTop: 'auto' }}
              >
                Registrer Gratis
              </Link>
            )}
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
            {isLoggedIn ? (
              isPaid && session?.plan === 'pro' ? (
                <form method="post" action="/api/billing/portal" style={{ marginTop: 'auto' }}>
                  <button type="submit" className="btn btn-secondary" style={{ justifyContent: 'center', width: '100%' }}>
                    Administrer abonnement
                  </button>
                </form>
              ) : (
                <form method="post" action="/api/billing/checkout?plan=pro" style={{ marginTop: 'auto' }}>
                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
                    {isPaid ? 'Bytt til Pro' : 'Start 14 dager gratis'}
                  </button>
                </form>
              )
            ) : (
              <Link
                href="/login?next=/abonnement"
                className="btn btn-primary"
                style={{ justifyContent: 'center', marginTop: 'auto' }}
              >
                Start 14 dager gratis
              </Link>
            )}
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
            {isLoggedIn ? (
              isPaid && session?.plan === 'trader' ? (
                <form method="post" action="/api/billing/portal" style={{ marginTop: 'auto' }}>
                  <button type="submit" className="btn btn-secondary" style={{ justifyContent: 'center', width: '100%' }}>
                    Administrer abonnement
                  </button>
                </form>
              ) : (
                <form method="post" action="/api/billing/checkout?plan=trader" style={{ marginTop: 'auto' }}>
                  <button type="submit" className="btn btn-secondary" style={{ justifyContent: 'center', width: '100%' }}>
                    Velg Trader
                  </button>
                </form>
              )
            ) : (
              <Link
                href="/login?next=/abonnement"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', marginTop: 'auto' }}
              >
                Velg Trader
              </Link>
            )}
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
              'Ja. Logg inn → Administrer abonnement → Avslutt. Ingen oppsigelsestid. Avslutter du i prøveperioden blir du aldri belastet.',
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
