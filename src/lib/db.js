import { supabase } from './supabase';

/**
 * Service for interacting with Resume data in Supabase
 */
export const ResumeDB = {
  /**
   * Save a complete resume and all its sections
   */
  async saveResume(userId, templateId, track, state) {
    try {
      // 1. Upsert the main resume record (we need an ID if it's new, or update existing)
      // Note: In a real app we'd track the current resume ID in Context. 
      // For now, we'll create a new one every time to demonstrate.
      
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .insert({
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
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // 2. Save Custom Sections
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
  }
};
