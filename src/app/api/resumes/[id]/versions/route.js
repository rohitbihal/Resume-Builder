import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimiter } from '@/lib/rateLimit';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { errorResponse, successResponse } from '@/lib/validate';

const log = logger('api/resumes/versions');

export async function GET(req, { params }) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId, method: 'GET' });

  // ─── 0. Rate Limiting (IP + generic User) ─────────────────────────────
  const authHeader = req.headers.get('authorization') || '';
  let jwtUserId = null;
  if (authHeader.startsWith('Bearer ')) {
    try {
      const payloadBase64 = authHeader.split('.')[1];
      if (payloadBase64) jwtUserId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).sub || null;
    } catch {}
  }

  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'general', jwtUserId);
  if (!rateLimitOk) {
    log.warn('Rate limit exceeded for fetching versions', { requestId });
    return NextResponse.json(
      errorResponse('Too many requests. Please wait.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const { id: resumeId } = params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      log.warn('Unauthorized versions fetch', { requestId, resumeId });
      return NextResponse.json(errorResponse('Unauthorized', requestId), { status: 401, headers: rateLimitHeaders });
    }

    // Verify ownership
    const { data: resume, error: authError } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', resumeId)
      .single();

    if (authError || !resume || resume.user_id !== user.id) {
      log.warn('Forbidden versions fetch attempt', { requestId, userId: user.id, resumeId });
      return NextResponse.json(errorResponse('Forbidden', requestId), { status: 403, headers: rateLimitHeaders });
    }

    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    log.info('Successfully fetched resume versions', { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json(successResponse({ versions: data }, requestId), { headers: rateLimitHeaders });
  } catch (error) {
    log.error('Fetch Versions Error', { requestId, error: error.message });
    return NextResponse.json(errorResponse('Failed to fetch versions', requestId), { status: 500, headers: rateLimitHeaders });
  }
}

export async function POST(req, { params }) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId, method: 'POST' });

  // ─── 0. Rate Limiting (IP + generic User) ─────────────────────────────
  const authHeader = req.headers.get('authorization') || '';
  let jwtUserId = null;
  if (authHeader.startsWith('Bearer ')) {
    try {
      const payloadBase64 = authHeader.split('.')[1];
      if (payloadBase64) jwtUserId = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8')).sub || null;
    } catch {}
  }

  const { success: rateLimitOk, headers: rateLimitHeaders } = rateLimiter(req, 'general', jwtUserId);
  if (!rateLimitOk) {
    log.warn('Rate limit exceeded for saving version', { requestId });
    return NextResponse.json(
      errorResponse('Too many requests. Please wait.', requestId),
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const { id: resumeId } = params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      log.warn('Unauthorized version save', { requestId, resumeId });
      return NextResponse.json(errorResponse('Unauthorized', requestId), { status: 401, headers: rateLimitHeaders });
    }

    // Verify ownership
    const { data: resume, error: authError } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', resumeId)
      .single();

    if (authError || !resume || resume.user_id !== user.id) {
      log.warn('Forbidden version save attempt', { requestId, userId: user.id, resumeId });
      return NextResponse.json(errorResponse('Forbidden', requestId), { status: 403, headers: rateLimitHeaders });
    }

    const { versionName, resumeData } = await req.json();

    if (!resumeData) {
      log.warn('Validation failed: missing resumeData', { requestId });
      return NextResponse.json(errorResponse('Resume data is required', requestId), { status: 400, headers: rateLimitHeaders });
    }

    const { data, error } = await supabase
      .from('resume_versions')
      .insert({
        resume_id: resumeId,
        version_name: versionName || `Version ${new Date().toLocaleString()}`,
        resume_data: resumeData,
      })
      .select()
      .single();

    if (error) throw error;

    log.info('Successfully saved resume version', { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json(successResponse({ version: data }, requestId), { headers: rateLimitHeaders });
  } catch (error) {
    log.error('Save Version Error', { requestId, error: error.message });
    return NextResponse.json(errorResponse('Failed to save version', requestId), { status: 500, headers: rateLimitHeaders });
  }
}
