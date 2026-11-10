import type { Metadata } from 'next';

/**
 * Layout server del área administrativa.
 * Solo aporta metadata: las páginas hijas siguen siendo client components.
 * El panel y sus sub-rutas no deben aparecer en buscadores ni indexadores.
 */
export const metadata: Metadata = {
  title: {
    default: 'Panel Administrativo',
    template: '%s | El Depósito',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
