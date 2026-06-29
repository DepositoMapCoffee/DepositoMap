import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.183'],
  async headers() {
    return [
      {
        // ── HTML: siempre verificar si hay versión nueva ──
        source: '/:path((?!_next/static|favicon\\.ico|icon\\.svg).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          ...SECURITY_HEADERS,
        ],
      },
      {
        // ── JS/CSS estáticos: contenido con hash → caché infinita ──
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
