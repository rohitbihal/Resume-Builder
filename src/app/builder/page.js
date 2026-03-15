'use client';

import { useState, useEffect } from 'react';
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

function BuilderInner() {
  const resumeState = useResume();
  const { track, activeTemplate, ...dataState } = resumeState;
  const dispatch = useResumeDispatch();
  const [session, setSession] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

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
    
    // In a real app we'd have a loading state here
    const result = await ResumeDB.saveResume(
      session.user.id,
      activeTemplate,
      track,
      dataState
    );
    
    if (result.success) {
      setCurrentResumeId(result.id);
      alert('Resume saved successfully!');
    } else {
      alert('Error saving resume: ' + result.error);
    }
  };

  const handleSaveVersion = async () => {
    if (!currentResumeId) {
      alert('Please save the resume first before creating a version.');
      return;
    }
    const versionName = prompt('Enter a name for this version:', `Version ${new Date().toLocaleTimeString()}`);
    if (!versionName) return;

    const result = await ResumeDB.saveVersion(currentResumeId, versionName, resumeState);
    if (result.id) {
      alert('Version saved!');
      loadVersions();
    } else {
      alert('Error saving version: ' + (result.error || 'Unknown error'));
    }
  };

  const handleLoadVersion = (version) => {
    if (confirm(`Are you sure you want to load "${version.version_name}"? This will overwrite your current changes.`)) {
      dispatch({ type: 'LOAD_RESUME', payload: version.resume_data });
    }
  };

  return (
    <>
      <RoleSelection />
      <Navbar />

      <div className={styles.builderContent}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BackButton href="/dashboard" label="Back to Dashboard" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cr-btn cr-btn-primary cr-btn-sm" onClick={handleSave}>Save Resume</button>
            {currentResumeId && (
              <button className="cr-btn cr-btn-secondary cr-btn-sm" onClick={handleSaveVersion}>Save Version</button>
            )}
          </div>
        </div>
        <h1 className={styles.builderTitle}>Build Your Resume</h1>
        <p className={styles.builderSubtitle}>Fill in your details below and watch your resume come alive in real-time.</p>

        <div className={styles.builderLayout}>
          <div className={styles.formColumn}>
            {versions.length > 0 && (
              <div className={styles.sectionCard} style={{ marginBottom: '1rem', border: '1px solid var(--cr-border)' }}>
                <div className={styles.sectionHeader}>
                  <h4 className={styles.sectionTitle}>🕒 Version History</h4>
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
