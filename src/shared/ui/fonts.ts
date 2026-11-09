/**
 * Tipografías de marca (self-hosted por next/font: sin peticiones a Google
 * en runtime, sin layout shift).
 *
 *  - Inter       → texto de interfaz
 *  - Noto Serif  → voz editorial (títulos). Expone --font-newsreader por
 *                  compatibilidad con los tokens existentes.
 */
import { Inter, Noto_Serif } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const fontSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
});

/** Clases a aplicar en <html> para activar ambas fuentes. */
export const fontVariables = `${fontSans.variable} ${fontSerif.variable}`;
