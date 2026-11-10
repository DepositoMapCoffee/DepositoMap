import type { Metadata } from 'next';

/** Panel administrativo (v2): nunca indexar. */
export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel El Depósito' },
  robots: { index: false, follow: false },
};

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-surface text-on-surface">{children}</div>;
}
