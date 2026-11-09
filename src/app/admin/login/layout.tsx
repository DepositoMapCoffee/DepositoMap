import type { Metadata } from 'next';

/**
 * Layout server de la pantalla de login admin.
 * Se resuelve con el template del layout admin: "Inicio de Sesión | El Depósito".
 */
export const metadata: Metadata = {
  title: 'Inicio de Sesión',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
