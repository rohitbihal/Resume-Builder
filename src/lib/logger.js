/**
 * Structured Logger
 * Emits JSON log lines to stdout/stderr — captured by Vercel's log aggregator.
 * Every log line includes: timestamp, level, route, message, plus any extra metadata.
 *
 * Usage:
 *   import { logger, getRequestId } from '@/lib/logger';
 *   const log = logger('api/generate-cover-letter');
 *   const requestId = getRequestId(req);
 *   log.info('Processing request', { requestId, userId });
 *   log.error('AI failed', { requestId, error: err.message });
 */

// ─── Log level thresholds ───────────────────────────────────────────────────
const LEVEL_RANK = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

// Suppress DEBUG in production — only INFO and above will be emitted
const CURRENT_RANK = process.env.NODE_ENV === 'production'
  ? LEVEL_RANK.INFO
  : LEVEL_RANK.DEBUG;

// ─── Request ID ─────────────────────────────────────────────────────────────

/**
 * Generate a short, URL-safe correlation ID (9 chars, uppercase).
 */
export function generateRequestId() {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

/**
 * Read the request ID from `X-Request-ID` header, or generate a new one.
 * Clients can pass a custom ID for end-to-end tracing.
 */
export function getRequestId(req) {
  try {
    return req.headers.get('x-request-id') || generateRequestId();
  } catch {
    return generateRequestId();
  }
}

// ─── Core Emitter ────────────────────────────────────────────────────────────

/**
 * Emits a single structured JSON log line.
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
 * @param {string} route
 * @param {string} message
 * @param {Record<string, unknown>} [meta]
 */
function emit(level, route, message, meta = {}) {
  if (LEVEL_RANK[level] < CURRENT_RANK) return;

  // Sanitize: cap error strings to avoid flooding logs
  const safeError = typeof meta.error === 'string'
    ? meta.error.substring(0, 400)
    : meta.error;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    route,
    message,
    ...meta,
    ...(safeError !== undefined && { error: safeError }),
  };

  // Route WARN+ERROR to stderr so Vercel shows them as errors in the UI
  if (level === 'WARN' || level === 'ERROR') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Creates a route-scoped logger instance.
 * @param {string} route — e.g. 'api/enhance-bullets'
 */
export function logger(route) {
  return {
    debug: (msg, meta = {}) => emit('DEBUG', route, msg, meta),
    info:  (msg, meta = {}) => emit('INFO',  route, msg, meta),
    warn:  (msg, meta = {}) => emit('WARN',  route, msg, meta),
    error: (msg, meta = {}) => emit('ERROR', route, msg, meta),
  };
}

/**
 * Log a request arrival at INFO level.
 * Trims the User-Agent to 120 chars to avoid log bloat.
 */
export function logRequest(log, req, extra = {}) {
  log.info('Request received', {
    method: req.method,
    path: (() => { try { return new URL(req.url).pathname; } catch { return req.url; } })(),
    ip: (() => { try { return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'; } catch { return 'unknown'; } })(),
    ua: (() => { try { return req.headers.get('user-agent')?.substring(0, 120) || 'none'; } catch { return 'none'; } })(),
    ...extra,
  });
}

/**
 * Log a response dispatch at INFO level.
 */
export function logResponse(log, status, durationMs, extra = {}) {
  log.info('Response sent', { status, durationMs, ...extra });
}
