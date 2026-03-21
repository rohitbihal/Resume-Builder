'use client';

import { useResume } from '@/context/ResumeContext';
import styles from './BuilderSidebar.module.css';

const SECTIONS = [
  { id: 'personalInfo', label: 'Contact', icon: '👤' },
  { id: 'executiveSummary', label: 'Summary', icon: '📝' },
  { id: 'workExperience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'academicProjects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '📜' },
];

export default function BuilderSidebar({ activeSection, onSectionChange }) {
  const resume = useResume();

  const calculateProgress = (sectionId) => {
    const data = resume[sectionId];
    if (!data) return 0;

    if (sectionId === 'personalInfo') {
      const fields = ['fullName', 'email', 'phone', 'location'];
      const filled = fields.filter(f => data[f]?.trim()).length;
      return (filled / fields.length) * 100;
    }

    if (sectionId === 'executiveSummary') {
      return data?.trim() ? 100 : 0;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return 0;
      // Check if at least one item has some meaningful data (not just an empty initial object)
      const hasContent = data.some(item => {
        const { id, ...rest } = item;
        return Object.values(rest).some(val => typeof val === 'string' && val.trim().length > 0);
      });
      return hasContent ? 100 : 0;
    }

    return 0;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h4 className={styles.title}>Sections</h4>
        <p className={styles.subtitle}>Click to navigate</p>
      </div>

      <div className={styles.navList}>
        {SECTIONS.map((section) => {
          const progress = calculateProgress(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <div className={styles.iconWrapper}>
                <CircularProgress size={32} progress={progress} />
                <span className={styles.icon}>{section.icon}</span>
              </div>
              <div className={styles.itemMeta}>
                <span className={styles.label}>{section.label}</span>
                <span className={styles.status}>
                  {progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Empty'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.overallProgress}>
        <div className={styles.progressText}>
          <span>Resume Strength</span>
          <span>85%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: '85%' }}></div>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ size, progress }) {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className={styles.svg}>
      <circle
        className={styles.bgCircle}
        stroke="var(--cr-border)"
        strokeWidth="2"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={styles.progressCircle}
        stroke="var(--cr-accent-primary)"
        strokeWidth="2"
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}
