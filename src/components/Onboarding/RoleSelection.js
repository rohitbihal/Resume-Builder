'use client';

import { useState } from 'react';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import { supabase } from '@/lib/supabase';
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
  const [loadingRole, setLoadingRole] = useState(null);

  if (onboardingComplete) return null;

  const handleSelect = async (roleId) => {
    setLoadingRole(roleId);
    try {
      // Get current user if supabase is available
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update profile in Supabase
          await supabase
            .from('profiles')
            .update({ role: roleId })
            .eq('id', user.id);
        }
      }
      
      // Update local context
      dispatch({ type: 'SET_TRACK', payload: roleId });
    } catch (err) {
      console.error('Error saving role:', err);
      // Fallback: still update context so user can use the app
      dispatch({ type: 'SET_TRACK', payload: roleId });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome! Let’s set your track.</h2>
          <p className={styles.subtitle}>Choose the role that best defines your current career stage. We’ll customize the builder for you.</p>
        </div>
        
        <div className={styles.grid}>
          {ROLES.map((role) => (
            <button 
              key={role.id} 
              type="button"
              className={`${styles.roleCard} ${loadingRole === role.id ? styles.loading : ''}`}
              onClick={() => handleSelect(role.id)}
              disabled={loadingRole !== null}
            >
              <div className={styles.text}>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <p className={styles.roleDesc}>{role.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
