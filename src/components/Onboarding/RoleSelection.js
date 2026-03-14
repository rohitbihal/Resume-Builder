'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './RoleSelection.module.css';

const ROLES = [
  { id: 'professional', title: 'Professional', icon: '💼', desc: 'Standard experience-focused resume for established careers.' },
  { id: 'fresher', title: 'Fresher', icon: '🎓', desc: 'Education and internship-focused layout for students & graduates.' },
  { id: 'freelancer', title: 'Freelancer', icon: '🎨', desc: 'Showcase your clients, portfolio, and specialized project work.' },
  { id: 'academic', title: 'Academic', icon: '🔬', desc: 'Focused on research, publications, and teaching experience.' },
  { id: 'designer', title: 'Designer', icon: '✨', desc: 'Visual-first layout focusing on portfolio and creative skills.' },
  { id: 'career-switcher', title: 'Career Switcher', icon: '🔄', desc: 'Emphasize transferable skills and relevant independent projects.' },
];

export default function RoleSelection() {
  const { onboardingComplete } = useResume();
  const dispatch = useResumeDispatch();

  if (onboardingComplete) return null;

  const handleSelect = (roleId) => {
    dispatch({ type: 'SET_TRACK', payload: roleId });
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
              className={styles.roleCard}
              onClick={() => handleSelect(role.id)}
            >
              <span className={styles.icon}>{role.icon}</span>
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
