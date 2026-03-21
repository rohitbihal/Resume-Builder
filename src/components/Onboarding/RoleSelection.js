'use client';

import { useState } from 'react';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import { supabase } from '@/lib/supabase';
import LinkedInImport from '@/components/ResumeForm/LinkedInImport';
import styles from './RoleSelection.module.css';

const ROLES = [
  { id: 'professional', title: 'Professional', desc: 'Standard experience-focused resume for established careers.' },
  { id: 'fresher', title: 'Fresher', desc: 'Education and internship-focused layout for students & graduates.' },
  { id: 'freelancer', title: 'Freelancer', desc: 'Showcase your clients, portfolio, and specialized project work.' },
  { id: 'academic', title: 'Academic', desc: 'Focused on research, publications, and teaching experience.' },
  { id: 'designer', title: 'Designer', desc: 'Visual-first layout focusing on portfolio and creative skills.' },
  { id: 'career-switcher', title: 'Career Switcher', desc: 'Emphasize transferable skills and relevant independent projects.' },
];

export default function RoleSelection() {
  const { onboardingComplete } = useResume();
  const dispatch = useResumeDispatch();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);

  if (onboardingComplete) return null;

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    setStep(2);
  };

  const finishOnboarding = async () => {
    setLoadingRole(true);
    try {
      // Get current user if supabase is available
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update profile in Supabase
          await supabase
            .from('profiles')
            .upsert({ 
              id: user.id,
              email: user.email,
              role: selectedRole,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }
      }
      
      dispatch({ type: 'SET_TRACK', payload: selectedRole });
    } catch (err) {
      console.error('Error saving role:', err);
      dispatch({ type: 'SET_TRACK', payload: selectedRole });
    } finally {
      setLoadingRole(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {step === 1 && (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Welcome! Let’s set your track.</h2>
              <p className={styles.subtitle}>Choose the role that best defines your current career stage. We’ll customize the builder for you.</p>
            </div>
            
            <div className={styles.grid}>
              {ROLES.map((role) => (
                <button 
                  key={role.id} 
                  type="button"
                  className={styles.roleCard}
                  onClick={() => handleSelectRole(role.id)}
                >
                  <div className={styles.text}>
                    <h3 className={styles.roleTitle}>{role.title}</h3>
                    <p className={styles.roleDesc}>{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.header} style={{ marginBottom: '2rem' }}>
              <h2 className={styles.title}>Jumpstart your resume</h2>
              <p className={styles.subtitle}>Import your entire public LinkedIn profile using our AI parser, or start from a blank slate.</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <LinkedInImport />
              
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--cr-text-muted)', marginBottom: '1rem' }}>Prefer to type it out yourself?</p>
                <button 
                  className="cr-btn cr-btn-primary cr-btn-lg" 
                  onClick={finishOnboarding}
                  disabled={loadingRole}
                  style={{ width: '100%' }}
                >
                  {loadingRole ? 'Setting up workspace...' : 'Start from scratch'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
