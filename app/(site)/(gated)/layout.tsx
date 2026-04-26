import { AuthGate } from '@/components/AuthGate';

export default function GatedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
