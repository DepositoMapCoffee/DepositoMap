import type { Metadata } from 'next';
import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${notoSerif.variable}`}>
      <body className="antialiased font-sans bg-brand-black text-brand-white">
        {children}
      </body>
    </html>
  );
}
