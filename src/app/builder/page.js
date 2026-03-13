'use client';

import { ResumeProvider, useResume, useResumeDispatch } from '@/context/ResumeContext';
import TrackSwitcher from '@/components/TrackSwitcher';
import PersonalInfo from '@/components/ResumeForm/PersonalInfo';
import Education from '@/components/ResumeForm/Education';
import Skills from '@/components/ResumeForm/Skills';
import WorkExperience from '@/components/ResumeForm/WorkExperience';
import Internships from '@/components/ResumeForm/Internships';
import AcademicProjects from '@/components/ResumeForm/AcademicProjects';
import ExecutiveSummary from '@/components/ResumeForm/ExecutiveSummary';
import Certifications from '@/components/ResumeForm/Certifications';
import CustomSection from '@/components/ResumeForm/CustomSection';
import PreviewPane from '@/components/ResumePreview/PreviewPane';
import styles from './builder.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase, signOut } from '@/lib/supabase';
import { ResumeDB } from '@/lib/db';
import AuthModal from '@/components/AuthModal';

function BuilderInner() {
  const resumeState = useResume();
  const { track, activeTemplate, ...dataState } = resumeState;
  const dispatch = useResumeDispatch();
  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    
    // In a real app we'd have a loading state here
    const result = await ResumeDB.saveResume(
      session.user.id,
      activeTemplate,
      track,
      dataState
    );
    
    if (result.success) {
      alert('Resume saved successfully!');
    } else {
      alert('Error saving resume: ' + result.error);
    }
  };

  return (
    <>
      <nav className={styles.builderNav}>
        <Link href="/" className={styles.navLogo}>CreativeResume</Link>
        <div className={styles.navLinks}>
          <Link href="/templates" className={styles.navLink}>Templates</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          {session ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--cr-text-muted)' }}>
                {session.user.email}
              </span>
              <button className="cr-btn" onClick={signOut}>Sign Out</button>
              <button className="cr-btn cr-btn-primary cr-btn-sm" onClick={handleSave}>Save Resume</button>
            </div>
          ) : (
            <button className="cr-btn cr-btn-primary cr-btn-sm" onClick={() => setIsAuthOpen(true)}>
              Sign In to Save
            </button>
          )}
        </div>
      </nav>

      <div className={styles.builderContent}>
        <h1 className={styles.builderTitle}>Build Your Resume</h1>
        <p className={styles.builderSubtitle}>Fill in your details below and watch your resume come alive in real-time.</p>

        <div className={styles.builderLayout}>
          <div className={styles.formColumn}>
            <TrackSwitcher />

            <div className={styles.sectionDivider}>
              <span className={styles.sectionDividerText}>Personal Details</span>
            </div>
            <PersonalInfo />

            {track === 'experienced' && (
              <>
                <div className={styles.sectionDivider}>
                  <span className={styles.sectionDividerText}>Professional Profile</span>
                </div>
                <ExecutiveSummary />
                <WorkExperience />
              </>
            )}

            {track === 'fresher' && (
              <>
                <div className={styles.sectionDivider}>
                  <span className={styles.sectionDividerText}>Experience & Projects</span>
                </div>
                <Internships />
                <AcademicProjects />
              </>
            )}

            <div className={styles.sectionDivider}>
              <span className={styles.sectionDividerText}>Education & Skills</span>
            </div>
            <Education />
            <Skills />

            {track === 'experienced' && <AcademicProjects />}

            <div className={styles.sectionDivider}>
              <span className={styles.sectionDividerText}>Additional Sections</span>
            </div>
            <Certifications />
            <CustomSection />
          </div>

          <div className={styles.previewColumn}>
            <PreviewPane />
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <BuilderInner />
    </ResumeProvider>
  );
}
