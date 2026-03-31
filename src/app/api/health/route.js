import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const log = logger('api/health');

// Never allow this response to be cached
export const dynamic = 'force-dynamic';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
];

export async function GET() {
  const startTime = Date.now();
  const checks = {};
  let overallStatus = 'healthy';

  // ─── Check 1: Environment Variables ───────────────────────────────────
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
  checks.environment = {
    status: missing.length === 0 ? 'ok' : 'degraded',
    message: missing.length === 0
      ? 'All required environment variables are present'
      : `Missing ${missing.length} variable(s): ${missing.join(', ')}`,
  };
  if (missing.length > 0) overallStatus = 'degraded';

  // ─── Check 2: Supabase Connectivity ───────────────────────────────────
  const supabaseCheckStart = Date.now();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // We use a manual AbortController + Promise.race to avoid dangling promise leaks
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 5_000);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );

      // Lightweight select: just verifies connectivity
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutHandle);

      checks.database = {
        status: error ? 'degraded' : 'ok',
        message: error ? `Query failed: ${error.message}` : 'Supabase is reachable',
        latencyMs: Date.now() - supabaseCheckStart,
      };
      if (error) overallStatus = 'degraded';
    } catch (err) {
      clearTimeout(timeoutHandle);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('abort');
      checks.database = {
        status: 'unhealthy',
        message: isTimeout
          ? 'Supabase did not respond within 5 seconds'
          : `Cannot reach Supabase: ${err.message}`,
        latencyMs: Date.now() - supabaseCheckStart,
      };
      overallStatus = 'unhealthy';
    }
  } else {
    checks.database = {
      status: 'skipped',
      message: 'Supabase credentials not configured',
    };
  }

  // ─── Check 3: Memory Usage ─────────────────────────────────────────────
  if (process.memoryUsage) {
    const mem = process.memoryUsage();
    const toMB = (bytes) => Math.round(bytes / 1024 / 1024);
    const heapPercent = Math.round((mem.heapUsed / mem.heapTotal) * 100);
    checks.memory = {
      status: heapPercent > 90 ? 'warn' : 'ok',
      heapUsedMB: toMB(mem.heapUsed),
      heapTotalMB: toMB(mem.heapTotal),
      heapPercent: `${heapPercent}%`,
      rssMB: toMB(mem.rss),
    };
  }

  const totalMs = Date.now() - startTime;

  const body = {
    status: overallStatus,
    version: process.env.npm_package_version ?? '1.0.0',
    environment: process.env.NODE_ENV ?? 'unknown',
    timestamp: new Date().toISOString(),
    responseTimeMs: totalMs,
    checks,
  };

  if (overallStatus !== 'healthy') {
    log.warn('Health check degraded or unhealthy', { status: overallStatus, responseTimeMs: totalMs });
  } else {
    log.info('Health check passed', { responseTimeMs: totalMs });
  }

  return NextResponse.json(body, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Content-Type': 'application/json',
    },
  });
}
