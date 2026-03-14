import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(req, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }
  const { id: resumeId } = params;

  try {
    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Versions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }
  const { id: resumeId } = params;

  try {
    const { versionName, resumeData } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 });
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Save Version Error:', error);
    return NextResponse.json({ error: 'Failed to save version' }, { status: 500 });
  }
}
