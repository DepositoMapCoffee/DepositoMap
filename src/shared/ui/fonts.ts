/**
 * Tipografías de marca, alojadas en el proyecto (paquetes @fontsource-variable).
 *
 *  - Inter       → texto de interfaz
 *  - Noto Serif  → voz editorial (títulos). Expone --font-newsreader por
 *                  compatibilidad con los tokens existentes.
 *
 * Se usan archivos locales en lugar de next/font/google para que el build
 * (local, Vercel o Docker en el VPS) no dependa de descargar fuentes de
 * Google: la descarga fallaba de forma intermitente en Turbopack.
 * Subconjunto "latin": cubre español, inglés y portugués (á, ñ, ç, ¿, ¡…).
 * Son fuentes variables: un archivo cubre todos los pesos.
 */
import localFont from 'next/font/local';

// Las rutas deben ser literales: next/font las resuelve en tiempo de compilación.
export const fontSans = localFont({
  src: [
    { path: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', weight: '100 900', style: 'normal' },
    { path: '../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const fontSerif = localFont({
  src: [
    { path: '../../../node_modules/@fontsource-variable/noto-serif/files/noto-serif-latin-wght-normal.woff2', weight: '100 900', style: 'normal' },
    { path: '../../../node_modules/@fontsource-variable/noto-serif/files/noto-serif-latin-wght-italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

/** Clases a aplicar en <html> para activar ambas fuentes. */
export const fontVariables = `${fontSans.variable} ${fontSerif.variable}`;
