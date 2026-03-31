import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, getRequestId } from '@/lib/logger';

const log = logger('api/cron/cleanup');
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1-minute execution max for free tier

export async function GET(req) {
  const requestId = getRequestId(req);
  
  // Vercel Cron Authentication
  // Only allow execution if the correct Cron Secret is passed
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    log.warn('Unauthorized cron execution attempt', { requestId });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    log.info('Starting stale data cleanup cron job', { requestId });

    // Identify stale, guest-owned or un-updated resumes older than 90 days.
    // Assuming 'updated_at' column exists, alternatively delete old versions.
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffIso = cutoffDate.toISOString();

    // 1. Delete old resume versions (cleanup raw DB bloat)
    const { data: oldVersions, error: versionError } = await supabase
      .from('resume_versions')
      .delete()
      .lt('created_at', cutoffIso)
      .select('id');

    if (versionError) throw versionError;

    const deletedCount = oldVersions ? oldVersions.length : 0;
    log.info('Cleanup complete', { requestId, deletedVersions: deletedCount, olderThan: cutoffIso });

    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} stale versions.` 
    });

  } catch (error) {
    log.error('Cron job failed', { requestId, error: error.message });
    return NextResponse.json({ error: 'Cron sweep failed' }, { status: 500 });
  }
}
