'use client';

import { useState, useEffect, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import TrackSwitcher from '@/components/TrackSwitcher';
import LinkedInImport from '@/components/ResumeForm/LinkedInImport';
import RoleSelection from '@/components/Onboarding/RoleSelection';
import DraggableSectionList from '@/components/ResumeForm/DraggableSectionList';
import PreviewPane from '@/components/ResumePreview/PreviewPane';
import BuilderSidebar from '@/components/ResumeForm/BuilderSidebar';
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
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [mobileTab, setMobileTab] = useState('form'); // 'form' | 'preview'
  const [isSaving, setIsSaving] = useState(false); // Prevents double-submission

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

  // Cross-Tab Synchronization
  useEffect(() => {
    if (!currentResumeId || previewMode) return;
    
    const channel = new BroadcastChannel(`resume_sync_${currentResumeId}`);
    channel.onmessage = (event) => {
      try {
        const incomingState = JSON.parse(event.data);
        const currentStateStr = JSON.stringify(resumeState);
        if (event.data !== currentStateStr) {
          dispatch({ type: 'LOAD_RESUME', payload: incomingState });
          setLastSavedState(event.data);
          addToast('Changes synced from another tab', 'info');
        }
      } catch (err) {
        console.error('Broadcast sync error', err);
      }
    };
    return () => channel.close();
  }, [currentResumeId, previewMode, resumeState, dispatch]);

  // Load existing resume if ID is present
  useEffect(() => {
    const loadResume = async () => {
      if (!idParam) {
        dispatch({ type: 'RESET' });
        setIsInitialLoading(false);
        return;
      }

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
          theme: data.theme || { color: '#00B8A9', font: 'Inter' },
          is_public: data.is_public || false,
          slug: data.slug || '',
          language: data.language || 'en',
          personalInfo: data.personal_info,
          education: data.education,
          skills: data.skills,
          workExperience: data.work_experience,
          internships: data.internships,
          academicProjects: data.academic_projects,
          executiveSummary: data.executive_summary,
          certifications: data.certifications,
          clientProjects: data.client_projects || [],
          researchPapers: data.research_papers || [],
          portfolio: data.portfolio || [],
          layoutOrder: data.layout_order || [],
          onboardingComplete: true
        };

        dispatch({ type: 'LOAD_RESUME', payload: loadedState });
        setLastSavedState(JSON.stringify(loadedState));

        // Offline Resilience Check
        try {
          const offlineBackup = localStorage.getItem(`resume_backup_${idParam}`);
          if (offlineBackup && offlineBackup !== JSON.stringify(loadedState)) {
            if (window.confirm('We found unsaved offline changes in your browser. Do you want to restore them?')) {
              dispatch({ type: 'LOAD_RESUME', payload: JSON.parse(offlineBackup) });
              setLastSavedState(offlineBackup);
              addToast('Offline backup restored. Save to sync to cloud.', 'info');
              setIsInitialLoading(false);
              return; // skip default load setup
            }
          }
        } catch (err) {
          console.error('Failed to parse offline backup', err);
        }

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

  // Auto-save logic & Offline Caching
  useEffect(() => {
    if (!session || !currentResumeId || previewMode || isSaving) return;

    const currentState = JSON.stringify(resumeState);
    if (lastSavedState && currentState === lastSavedState) return;

    // 1. Immediately cache offline and broadcast to other tabs
    localStorage.setItem(`resume_backup_${currentResumeId}`, currentState);
    try {
      const channel = new BroadcastChannel(`resume_sync_${currentResumeId}`);
      channel.postMessage(currentState);
      channel.close();
    } catch (e) { /* ignore in non-supporting browsers */ }

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
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
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds debounce

    return () => clearTimeout(timer);
  }, [resumeState, session, currentResumeId, lastSavedState, activeTemplate, track, dataState, previewMode, isSaving]);

  const loadVersions = useCallback(async () => {
    if (!currentResumeId) return;
    setIsLoadingVersions(true);
    try {
      const data = await ResumeDB.getResumeVersions(currentResumeId);
      if (Array.isArray(data)) {
        setVersions(data);
      }
    } catch (err) {
      addToast('Error loading versions', 'error');
    } finally {
      setIsLoadingVersions(false);
    }
  }, [currentResumeId]);

  useEffect(() => {
    if (currentResumeId && session) {
      loadVersions();
    }
  }, [currentResumeId, session, loadVersions]);

  const handleSave = async () => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    // Prevent double-submission
    if (isSaving) return;

    setIsSaving(true);
    try {
      const result = await ResumeDB.saveResume(
        session.user.id,
        activeTemplate,
        track,
        dataState,
        currentResumeId
      );

      if (result.success) {
        setCurrentResumeId(result.id);
        const savedStr = JSON.stringify(resumeState);
        setLastSavedState(savedStr);
        localStorage.setItem(`resume_backup_${result.id}`, savedStr);
        addToast('Resume saved successfully!');
      } else {
        addToast('Error saving resume: ' + result.error, 'error');
      }
    } finally {
      setIsSaving(false);
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

      <div className={styles.builderTopBar}>
        <div className={styles.topBarLeft}>
          <BackButton href="/dashboard" label="Back to Dashboard" />
          <div className={styles.atsChip}>
            <span className={styles.atsDot}></span>
            Real-time ATS Score: <strong>{dataState.skills?.length > 5 ? '85%' : '45%'}</strong>
          </div>
        </div>
        <div className={styles.topBarRight}>
          {!previewMode && (
            <>
              <div className={styles.saveIndicator}>
                 {isSaving ? '⏳ Saving...' : lastSavedState === JSON.stringify(resumeState) ? '✓ Auto-saved' : '● Unsaved'}
              </div>
              <button 
                className="cr-btn cr-btn-primary" 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                  borderRadius: 'var(--cr-radius-full)', 
                  padding: '0 1.5rem',
                  opacity: isSaving ? 0.65 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? '⏳ Saving...' : 'Save & Sync'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher - only visible on mobile */}
      <div className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTabBtn} ${mobileTab === 'form' ? styles.activeTab : ''}`}
          onClick={() => setMobileTab('form')}
        >✏️ Edit Form</button>
        <button
          className={`${styles.mobileTabBtn} ${mobileTab === 'preview' ? styles.activeTab : ''}`}
          onClick={() => setMobileTab('preview')}
        >👁️ Preview</button>
      </div>

      <div className={`${styles.builderLayout} ${previewMode ? styles.previewOnly : ''}`}>
        {!previewMode && (
          <>
            <aside className={styles.sidebarColumn}>
              <BuilderSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </aside>
            
            {/* Form column: hidden on mobile when preview tab is active */}
          <main className={`${styles.formColumn} ${mobileTab === 'preview' ? styles.mobileHidden : ''} ${dataState.importedFieldsHighlight ? 'imported-active' : ''}`}>
            {versions.length > 0 && (
              <div className="cr-card cr-glass" style={{ marginBottom: '1rem' }}>
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--cr-border)', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Version History</h4>
                </div>
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {versions.map(v => (
                    <div 
                      key={v.id} 
                      onClick={() => handleLoadVersion(v)}
                      style={{ padding: '0.4rem 0', cursor: 'pointer', borderBottom: '1px solid var(--cr-border)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{v.version_name}</span>
                      <span style={{ color: 'var(--cr-text-muted)' }}>{new Date(v.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <section className="animate-fade-in">
              <DraggableSectionList filteredSection={activeSection} />
            </section>
          </main>
        </>
        )}

        {/* Preview column: hidden on mobile when form tab is active */}
        <div 
          className={`${previewMode ? styles.previewCentered : styles.previewColumn} ${!previewMode && mobileTab === 'form' ? styles.mobileHidden : ''}`}
        >
          <PreviewPane resumeId={currentResumeId} />
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function BuilderFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem', textAlign: 'center', background: 'var(--cr-bg-main)' }}>
      <div className="cr-card cr-glass" style={{ maxWidth: '500px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--cr-danger)' }}>Something went wrong.</h2>
        <p style={{ color: 'var(--cr-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Unfortunately, the builder encountered an unexpected error. Don&apos;t worry—your recent progress may be safely cached in your browser.
        </p>
        <pre style={{ background: 'var(--cr-bg-alt)', padding: '1rem', borderRadius: 'var(--cr-radius)', fontSize: '0.75rem', overflowX: 'auto', marginBottom: '1.5rem', textAlign: 'left', color: 'var(--cr-text-main)' }}>
          {error.message}
        </pre>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="cr-btn cr-btn-primary" onClick={resetErrorBoundary}>
            Try Again
          </button>
          <Link href="/dashboard" className="cr-btn cr-btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ErrorBoundary FallbackComponent={BuilderFallback}>
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--cr-bg-main)' }}><p>Loading...</p></div>}>
        <BuilderInner />
      </Suspense>
    </ErrorBoundary>
  );
}
