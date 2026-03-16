'use client';

import { useState, useEffect, Suspense } from 'react';
import { ResumeProvider, useResume, useResumeDispatch } from '@/context/ResumeContext';
import TrackSwitcher from '@/components/TrackSwitcher';
import LinkedInImport from '@/components/ResumeForm/LinkedInImport';
import RoleSelection from '@/components/Onboarding/RoleSelection';
import DraggableSectionList from '@/components/ResumeForm/DraggableSectionList';
import PreviewPane from '@/components/ResumePreview/PreviewPane';
import styles from './builder.module.css';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import { ResumeDB } from '@/lib/db';
import { ToastContainer } from '@/components/Notifications/Toast';
import { useSearchParams } from 'next/navigation';

function BuilderInner() {
  const resumeState = useResume();
  const { track, activeTemplate, ...dataState } = resumeState;
  const dispatch = useResumeDispatch();
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const previewMode = searchParams.get('preview') === 'true';
  const downloadMode = searchParams.get('download') === 'true';

  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(idParam);
  const [versions, setVersions] = useState([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastSavedState, setLastSavedState] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(!!idParam);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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

  // Load existing resume if ID is present
  useEffect(() => {
    const loadResume = async () => {
      if (!idParam) return;
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', idParam)
        .single();
        
      if (data && !error) {
        // Map DB fields back to context state
        const loadedState = {
          track: data.track,
          activeTemplate: data.template_id,
          personalInfo: data.personal_info,
          education: data.education,
          skills: data.skills,
          workExperience: data.work_experience,
          internships: data.internships,
          academicProjects: data.academic_projects,
          executiveSummary: data.executive_summary,
          certifications: data.certifications,
          onboardingComplete: true
        };
        
        dispatch({ type: 'LOAD_RESUME', payload: loadedState });
        setLastSavedState(JSON.stringify(loadedState));
      } else {
        addToast('Error loading resume: ' + (error?.message || 'Not found'), 'error');
      }
      setIsInitialLoading(false);
    };

    loadResume();
  }, [idParam, dispatch]);

  // Handle auto-download
  useEffect(() => {
    if (downloadMode && !isInitialLoading) {
      const timer = setTimeout(() => {
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) downloadBtn.click();
      }, 1500); // Give it a moment to render
      return () => clearTimeout(timer);
    }
  }, [downloadMode, isInitialLoading]);

  // Auto-save logic
  useEffect(() => {
    if (!session || !currentResumeId || previewMode) return;

    const currentState = JSON.stringify(resumeState);
    if (lastSavedState && currentState === lastSavedState) return;

    const timer = setTimeout(async () => {
      const result = await ResumeDB.saveResume(
        session.user.id,
        activeTemplate,
        track,
        dataState,
        currentResumeId
      );
      if (result.success) {
        setLastSavedState(currentState);
        addToast('Changes saved automatically', 'info');
      }
    }, 30000); // 30 seconds debounce

    return () => clearTimeout(timer);
  }, [resumeState, session, currentResumeId, lastSavedState, activeTemplate, track, dataState, previewMode]);

  useEffect(() => {
    if (currentResumeId && session) {
      loadVersions();
    }
  }, [currentResumeId, session]);

  const loadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const data = await ResumeDB.getResumeVersions(currentResumeId);
      if (Array.isArray(data)) {
        setVersions(data);
      }
    } catch (err) {
      console.error('Error loading versions:', err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    
    const result = await ResumeDB.saveResume(
      session.user.id,
      activeTemplate,
      track,
      dataState,
      currentResumeId
    );
    
    if (result.success) {
      setCurrentResumeId(result.id);
      setLastSavedState(JSON.stringify(resumeState));
      addToast('Resume saved successfully!');
    } else {
      addToast('Error saving resume: ' + result.error, 'error');
    }
  };

  const handleSaveVersion = async () => {
    if (!currentResumeId) {
      addToast('Please save the resume first before creating a version.', 'error');
      return;
    }
    const versionName = prompt('Enter a name for this version:', `Version ${new Date().toLocaleTimeString()}`);
    if (!versionName) return;

    const result = await ResumeDB.saveVersion(currentResumeId, versionName, resumeState);
    if (result.id) {
      addToast('Version saved!');
      loadVersions();
    } else {
      addToast('Error saving version: ' + (result.error || 'Unknown error'), 'error');
    }
  };

  const handleLoadVersion = (version) => {
    if (confirm(`Are you sure you want to load "${version.version_name}"? This will overwrite your current changes.`)) {
      dispatch({ type: 'LOAD_RESUME', payload: version.resume_data });
      setLastSavedState(JSON.stringify(version.resume_data));
      addToast('Version loaded');
    }
  };

  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cr-bg-main)' }}>
        <p>Loading your resume...</p>
      </div>
    );
  }

  return (
    <>
      <RoleSelection />
      <Navbar />

      <div className={styles.builderContent}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackButton href="/dashboard" label="Back to Dashboard" />
          {!previewMode && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="cr-btn cr-btn-primary cr-btn-sm" onClick={handleSave}>Save Resume</button>
              {currentResumeId && (
                <button className="cr-btn cr-btn-secondary cr-btn-sm" onClick={handleSaveVersion}>Save Version</button>
              )}
            </div>
          )}
        </div>
        
        <h1 className={styles.builderTitle}>
          {previewMode ? 'Resume Preview' : 'Build Your Resume'}
        </h1>
        <p className={styles.builderSubtitle}>
          {previewMode ? 'Viewing your saved resume structure.' : 'Fill in your details below and watch your resume come alive in real-time.'}
        </p>

        <div className={`${styles.builderLayout} ${previewMode ? styles.previewOnly : ''}`}>
          {!previewMode && (
            <div className={styles.formColumn}>
              {versions.length > 0 && (
                <div className={styles.sectionCard} style={{ marginBottom: '1rem', border: '1px solid var(--cr-border)' }}>
                  <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>Version History</h4>
                  </div>
                  <div style={{ padding: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
                    {versions.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => handleLoadVersion(v)}
                        style={{ 
                          padding: '0.5rem', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid var(--cr-border)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                        className={styles.versionItem}
                      >
                        <span>{v.version_name}</span>
                        <span style={{ color: 'var(--cr-text-muted)' }}>{new Date(v.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <LinkedInImport />
              <TrackSwitcher />

              <DraggableSectionList />
            </div>
          )}

          <div className={previewMode ? styles.previewCentered : styles.previewColumn}>
            <PreviewPane />
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumeProvider>
        <BuilderInner />
      </ResumeProvider>
    </Suspense>
  );
}
