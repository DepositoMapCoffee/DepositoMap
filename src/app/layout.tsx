import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MotionConfig } from 'framer-motion';
import ToastContainer from '@/legacy/components/ui/ToastContainer';
import { fontVariables } from '@/shared/ui/fonts';

export const metadata: Metadata = {
  title: 'El Depósito | Specialty Coffee',
  description: 'Mapa interactivo de los mejores cafés de especialidad de Colombia.',
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
      <body className="antialiased font-sans bg-brand-black text-brand-white">
        {/* reducedMotion="user": respeta prefers-reduced-motion del sistema */}
        <MotionConfig reducedMotion="user">
          {children}
          <ToastContainer />
        </MotionConfig>
      </body>
    </html>
  );
}
