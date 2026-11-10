import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from '@/shared/ui/fonts';

export const metadata: Metadata = {
  title: 'El Depósito | Café de especialidad en Cartagena',
  description:
    'Cuatro generaciones conectando cafés extraordinarios de Colombia con quienes los valoran. Coffee Tasting en el Barrio San Diego y mapa de orígenes.',
};

/**
 * Viewport separado del metadata — requerido por Next.js 14+
 * viewport-fit=cover: activa safe-area-inset-* en iPhone con notch/Dynamic Island
 * themeColor: colorea la barra del navegador en Safari/Chrome móvil
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',        // clave para env(safe-area-inset-*) en iOS
  themeColor: '#0A0A0A',       // sincroniza barra del navegador con el fondo de la app
  interactiveWidget: 'resizes-content', // el teclado virtual no "empuja" el viewport en iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr" className={fontVariables}>
      <body className="antialiased font-sans bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
