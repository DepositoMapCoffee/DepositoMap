import type { NextConfig } from "next";
import path from "node:path";

/** Raíz del proyecto (evita que Next tome un lockfile de una carpeta superior). */
const ROOT = path.resolve(__dirname);

/**
 * Headers de seguridad incluyendo Content-Security-Policy.
 *
 * Notas del CSP:
 * - style-src 'unsafe-inline': framer-motion inyecta estilos inline.
 * - script-src 'unsafe-inline' (prod): Next.js embebe el payload RSC en un
 *   <script> inline dentro del HTML estático.
 * - 'unsafe-eval' solo en development: lo requiere el HMR de Turbopack.
 * - connect-src: API REST (https) y Realtime (websocket wss) de Supabase.
 * - img-src data: (SVG de ruido inline en HomeView) y blob: (next/image).
 */
function buildSecurityHeaders(): { key: string; value: string }[] {
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  return [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  ];
}

const nextConfig: NextConfig = {
  // Servidor autocontenido para la imagen Docker del VPS (Vercel lo ignora).
  output: 'standalone',
  outputFileTracingRoot: ROOT,
  turbopack: { root: ROOT },
  allowedDevOrigins: ['192.168.0.183'],
  // El panel viejo (/admin) y su login se unificaron en /panel e /ingresar.
  async redirects() {
    return [
      { source: '/admin', destination: '/panel/catalogo', permanent: true },
      { source: '/admin/login', destination: '/ingresar?siguiente=/panel/catalogo', permanent: true },
      { source: '/admin/:ruta*', destination: '/panel/:ruta*', permanent: true },
    ];
  },
  async headers() {
    const htmlHeaders = [
      {
        // ── HTML: siempre verificar si hay versión nueva ──
        source: '/:path((?!_next/static|favicon\\.ico|icon\\.svg).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store' },
          ...buildSecurityHeaders(),
        ],
      },
    ];

    // Cache-Control `immutable` en /_next/static SOLO en producción:
    // en dev los chunks de Turbopack cambian en cada HMR y un header
    // inmutable rompe su revalidación (error "module factory is not available"
    // por chunks obsoletos servidos desde la caché del navegador).
    if (process.env.NODE_ENV === 'production') {
      htmlHeaders.push({
        // ── JS/CSS estáticos: contenido con hash → caché infinita ──
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      });
    }

    return htmlHeaders;
  },
};

export default nextConfig;
