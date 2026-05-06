import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css';
import ToastContainer from '@/components/ui/ToastContainer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/** Noto Serif — voz editorial para títulos y headlines */
const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-newsreader', // reutilizamos la variable existente
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
});

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
    <html lang="es" dir="ltr" className={`${inter.variable} ${notoSerif.variable}`}>
      <head>
        {/* Preconnect a Google Fonts para reducir latencia de fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans bg-brand-black text-brand-white">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
