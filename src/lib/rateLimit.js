/**
 * Production Rate Limiter
 * In-memory sliding window algorithm — optimal for Vercel Serverless.
 * Supports per-IP (anonymous) AND per-userId (authenticated) limiting.
 *
 * Usage:
 *   import { rateLimiter } from '@/lib/rateLimit';
 *   const { success, headers } = rateLimiter(req, 'ai', userId);
 *   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers });
 */

// ─── In-memory store ──────────────────────────────────────────────────────────
// Map<key, number[]>  — key => array of request timestamps
const store = new Map();
let lastCleanup = Date.now();

/**
 * Rate limit configuration per endpoint type.
 * window: milliseconds | max: requests per window
 */
export const LIMITS = {
  ai:      { window: 60_000, max: 10  }, // 10 AI (Gemini) requests/min
  auth:    { window: 60_000, max: 5   }, // 5 auth attempts/min
  payment: { window: 60_000, max: 10  }, // 10 payment requests/min
  general: { window: 60_000, max: 60  }, // 60 general API calls/min
};

const MAX_WINDOW = Math.max(...Object.values(LIMITS).map(l => l.window));
const CLEANUP_INTERVAL = 5 * 60 * 1000; // clean every 5 minutes

/**
 * Purge stale entries to prevent memory growth over long-running instances.
 * Only runs at most every CLEANUP_INTERVAL ms.
 */
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - MAX_WINDOW;
  for (const [key, timestamps] of store.entries()) {
    const fresh = timestamps.filter(ts => ts > cutoff);
    if (fresh.length === 0) {
      store.delete(key);
    } else {
      store.set(key, fresh);
    }
  }
}

/**
 * Core sliding-window rate check for a single key.
 * @param {string} key
 * @param {'ai'|'auth'|'payment'|'general'} type
 * @returns {{ success: boolean, limit: number, remaining: number, resetAt: number }}
 */
function checkLimit(key, type) {
  const config = LIMITS[type] ?? LIMITS.general;
  const now = Date.now();
  const windowStart = now - config.window;

  maybeCleanup();

  const hits = (store.get(key) ?? []).filter(ts => ts > windowStart);

  if (hits.length >= config.max) {
    // resetAt = when the oldest hit will expire (sliding window)
    const resetAt = hits[0] + config.window;
    return { success: false, limit: config.max, remaining: 0, resetAt };
  }

  hits.push(now);
  store.set(key, hits);

  return {
    success: true,
    limit: config.max,
    remaining: config.max - hits.length,
    resetAt: now + config.window,
  };
}

/**
 * Safely extracts the real client IP from Vercel/proxy headers.
 * Never throws — returns 'unknown' on any failure.
 */
function getClientIp(req) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-real-ip') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Main rate limiter. Checks BOTH IP-level AND user-level limits.
 *
 * @param {Request} req
 * @param {'ai'|'auth'|'payment'|'general'} type
 * @param {string|null} [userId] — Supabase user ID or null for anonymous
 * @returns {{ success: boolean, headers: Record<string, string> }}
 */
export function rateLimiter(req, type = 'general', userId = null) {
  const ip = getClientIp(req);
  const ipResult = checkLimit(`ip:${type}:${ip}`, type);

  // Only check user-level if a real userId is provided
  const userResult = userId
    ? checkLimit(`user:${type}:${userId}`, type)
    : { success: true, limit: LIMITS[type]?.max ?? 60, remaining: 99, resetAt: 0 };

  const blocked = !ipResult.success || !userResult.success;
  // Use the result that triggered the block (or ipResult as primary)
  const primary = !ipResult.success ? ipResult : userResult;

  const retryAfterMs = Math.max(primary.resetAt - Date.now(), 0);
  const retryAfterSecs = Math.ceil(retryAfterMs / 1000) || 1;

  const headers = {
    'X-RateLimit-Limit': String(primary.limit),
    'X-RateLimit-Remaining': String(Math.min(ipResult.remaining, userResult.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(primary.resetAt / 1000)),
    ...(blocked && { 'Retry-After': String(retryAfterSecs) }),
  };

  return { success: !blocked, headers };
}
