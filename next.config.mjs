/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @sparticuz/chromium-min to work in Vercel functions
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core', 'pdf-parse'],

  // Hide "X-Powered-By: Next.js" header (basic security hardening)
  poweredByHeader: false,

  // Compress responses with gzip/brotli (performance)
  compress: true,

  // HTTP response headers (applied globally before middleware runs)
  async headers() {
    return [
      // ─── Global Security Headers ──────────────────────────────────────────
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https://*.supabase.co;",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://www.googletagmanager.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "img-src 'self' blob: data: https://*.supabase.co https://api.qrserver.com https://*.google-analytics.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com;",
              "frame-ancestors 'none';",
              "upgrade-insecure-requests;",
            ].join(' '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // ─── Static Assets: Cache aggressively ───────────────────────────────
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ─── Images: Cache for 1 day ───────────────────────────────────────────
      {
        source: '/:path*\\.(png|jpg|jpeg|gif|svg|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // ─── API Routes: Never cache (sensitive data) ──────────────────────────
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      // ─── Authenticated Pages: Never cache ─────────────────────────────────
      {
        source: '/(dashboard|builder|cover-letter)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, private',
          },
        ],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cysrgtnijumcpwynhfhj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
