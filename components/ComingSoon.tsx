import Link from 'next/link';

export function ComingSoon({
  feature,
  description,
}: {
  feature: string;
  description?: string;
}) {
  return (
    <div className="soon-shell">
      <div className="soon-eyebrow">KOMMER SNART</div>
      <h1 className="h-1" style={{ marginTop: 4 }}>
        {feature}
      </h1>
      <p
        className="lede"
        style={{ margin: '18px auto 32px', maxWidth: '46ch' }}
      >
        {description ||
          'Vi er midt i å bygge denne funksjonen. Følg oss på e-post for å bli varslet når den lanseres.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <Link href="/markedet" className="btn btn-secondary btn-lg">
          ← Til markedet
        </Link>
        <Link href="/kontakt" className="btn btn-primary btn-lg">
          Si fra når den er klar →
        </Link>
      </div>
    </div>
  );
}
