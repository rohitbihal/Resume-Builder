import { supabase } from './supabase';

/**
 * Service for interacting with Resume data in Supabase
 */
export const ResumeDB = {
  /**
   * Save a complete resume and all its sections
   */
  async saveResume(userId, templateId, track, state, resumeId = null) {
    try {
      const resumeDataToSave = {
        user_id: userId,
        template_id: templateId,
        title: `${state.personalInfo?.firstName || 'Untitled'} Resume`,
        track: track,
        personal_info: state.personalInfo,
        education: state.education,
        skills: state.skills,
        work_experience: state.workExperience,
        internships: state.internships,
        academic_projects: state.academicProjects,
        executive_summary: state.executiveSummary,
        certifications: state.certifications,
        updated_at: new Date().toISOString()
      };

      if (resumeId) {
        resumeDataToSave.id = resumeId;
      }

      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .upsert(resumeDataToSave)
        .select()
        .single();

      if (resumeError) throw resumeError;

      // 2. Clear and Save Custom Sections
      if (resumeId) {
        await supabase.from('resume_sections').delete().eq('resume_id', resumeId);
      }

      if (state.customSections && state.customSections.length > 0) {
        const sectionsToInsert = state.customSections.map((section, index) => ({
          resume_id: resumeData.id,
          title: section.title,
          content: section.items, // Array of TipTap HTMl strings
          sort_order: index
        }));

        const { error: sectionsError } = await supabase
          .from('resume_sections')
          .insert(sectionsToInsert);

        if (sectionsError) throw sectionsError;
      }

      return { success: true, id: resumeData.id };

    } catch (error) {
      console.error('Error saving resume:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch a user's resumes
   */
  async getUserResumes(userId) {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        id, title, track, created_at, updated_at,
        templates ( name )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }
    return data;
  },

  /**
   * Save a version snapshot
   */
  async saveVersion(resumeId, versionName, data) {
    const res = await fetch(`/api/resumes/${resumeId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionName, resumeData: data }),
    });
    return res.json();
  },

  /**
   * Get all versions for a resume
   */
  async getResumeVersions(resumeId) {
    const res = await fetch(`/api/resumes/${resumeId}/versions`);
    return res.json();
  }
};
