/**
 * @deprecated The real auth gate now lives in middleware.ts and the server
 * `requirePaid()` helper. This component is kept only so old imports don't
 * break — it's a no-op pass-through. Safe to delete after auditing imports.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
