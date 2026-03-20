import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ShareClient from './ShareClient';
import styles from './SharePage.module.css';

// Dynamic Metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  // Try fetching by ID first, then by slug
  let { data: resume } = await supabase
    .from('resumes')
    .select('personal_info, track, is_public')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (!resume || !resume.is_public) {
    return { title: 'Resume Not Found | CreativeResume' };
  }

  const name = resume.personal_info?.fullName || 'Professional';
  return {
    title: `${name}'s Professional Resume | CreativeResume`,
    description: `View ${name}'s ${resume.track || ''} resume. Built with CreativeResume.`,
    openGraph: {
      title: `${name}'s Resume`,
      description: `Check out this professional ${resume.track || ''} resume.`,
      type: 'profile',
    },
  };
}

export default async function Page({ params }) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  try {
    // Dual lookup: ID or Slug
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (resumeError || !resume) throw new Error('Resume not found');
    if (!resume.is_public) throw new Error('This resume is private');

    // Fetch custom sections
    const { data: sectionsData } = await supabase
      .from('resume_sections')
      .select('*')
      .eq('resume_id', resume.id)
      .order('sort_order', { ascending: true });

    // Transform database fields to context state format
    const formattedData = {
      id: resume.id,
      slug: resume.slug,
      track: resume.track,
      activeTemplate: resume.template_id,
      theme: resume.theme || { color: '#00B8A9', font: 'Inter' },
      is_public: resume.is_public,
      layoutOrder: resume.layout_order || [],
      personalInfo: resume.personal_info || {},
      executiveSummary: resume.executive_summary || '',
      education: resume.education || [],
      skills: resume.skills || [],
      workExperience: resume.work_experience || [],
      internships: resume.internships || [],
      academicProjects: resume.academic_projects || [],
      certifications: resume.certifications || [],
      clientProjects: resume.client_projects || [],
      researchPapers: resume.research_papers || [],
      portfolio: resume.portfolio || [],
      customSections: (sectionsData || []).map(s => ({
        id: s.id,
        title: s.title,
        items: s.content || []
      })),
    };

    return <ShareClient resumeData={formattedData} />;

  } catch (err) {
    return (
      <div className={styles.errorContainer}>
        <h1>Oops!</h1>
        <p>{err.message === 'This resume is private' ? 'This resume is no longer public.' : 'We couldn\'t find the resume you\'re looking for.'}</p>
        <a href="/" className="cr-btn cr-btn-primary">Build Your Own Resume</a>
      </div>
    );
  }
}
