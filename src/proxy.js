/**
 * Next.js Unified Proxy (formerly Middleware)
 *
 * Execution order (runs before every matched request):
 *   1. Skip non-page/api routes (static assets handled by Next.js)
 *   2. Supabase session refresh — ONLY for page routes that need auth
 *   3. Auth guard: redirect /builder to /auth if not logged in
 *   4. CORS preflight (OPTIONS) handling
 *   5. Bot protection on AI endpoints (missing User-Agent → 403)
 *   6. Security headers on every response
 *   7. CORS headers on API responses
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Origins allowed to call our API. Add your production domain via env var. */
const TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

/** AI routes to apply bot-protection on */
const AI_ROUTES = [
  '/api/enhance-bullets',
  '/api/generate-cover-letter',
  '/api/suggest-skills',
  '/api/parse-linkedin',
];

/** Routes that bypass CORS origin-check (Razorpay calls us, health is public) */
const PUBLIC_API_ROUTES = [
  '/api/razorpay/webhook',
  '/api/health',
];

/** Page routes that require auth — only these trigger a Supabase session check */
const PROTECTED_PAGE_PREFIXES = ['/builder'];

// ─── Content Security Policy ─────────────────────────────────────────────────

const CSP = [
  "default-src 'self'",
  // Next.js needs unsafe-eval in dev mode; unsafe-inline for Razorpay checkout script
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com",
  "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com https://www.google-analytics.com https://analytics.google.com https://generativelanguage.googleapis.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

// ─── Proxy ───────────────────────────────────────────────────────────────────

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(p => pathname.startsWith(p));

  // ─── 1. Supabase Session Refresh ──────────────────────────────────────
  // Only call Supabase on protected page routes. Skipping this for API routes
  // and public pages avoids an unnecessary network round-trip on every call.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (isProtectedPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // getUser() validates the session JWT with Supabase Auth server
    const { data: { user } } = await supabase.auth.getUser();

    // ─── 2. Auth Guard ──────────────────────────────────────────────────
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ─── 3. Bot Protection on AI Routes ───────────────────────────────────
  if (isApiRoute && AI_ROUTES.some(r => pathname.startsWith(r))) {
    const ua = request.headers.get('user-agent') || '';
    if (ua.trim().length < 5) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Forbidden: missing or invalid User-Agent header',
          timestamp: new Date().toISOString(),
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ─── 4. CORS Preflight (OPTIONS) ──────────────────────────────────────
  if (request.method === 'OPTIONS' && isApiRoute) {
    const origin = request.headers.get('origin') || '';
    const isPublic = PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));
    const isAllowed = isPublic ||
      process.env.NODE_ENV === 'development' ||
      TRUSTED_ORIGINS.includes(origin);

    if (!isAllowed) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-Idempotency-Key',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    });
  }

  // ─── 5. Security Headers on ALL Responses ─────────────────────────────
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()'
  );
  response.headers.set('Content-Security-Policy', CSP);
  // Remove fingerprinting headers (Next.js may add these)
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  // ─── 6. CORS Headers on API Responses ─────────────────────────────────
  if (isApiRoute) {
    const origin = request.headers.get('origin') || '';
    const isPublic = PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));
    const isAllowed = isPublic ||
      process.env.NODE_ENV === 'development' ||
      TRUSTED_ORIGINS.includes(origin);

    const allowOrigin = isAllowed ? (origin || '*') : (TRUSTED_ORIGINS[0] || 'null');

    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-Idempotency-Key');
    response.headers.set('Vary', 'Origin');

    // No-cache on all sensitive routes
    const sensitiveRoutes = ['/api/razorpay', '/api/resumes', '/api/enhance-bullets', '/api/generate-cover-letter', '/api/suggest-skills', '/api/parse-linkedin'];
    if (sensitiveRoutes.some(r => pathname.startsWith(r))) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.headers.set('Pragma', 'no-cache');
    }
  }

  return response;
}

// ─── Matcher — exclude static/image/font assets ──────────────────────────────
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|woff|woff2|ttf|eot)).*)',
  ],
};
