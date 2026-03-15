'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './TrackSwitcher.module.css';

export default function TrackSwitcher() {
  const { track } = useResume();
  const dispatch = useResumeDispatch();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Choose Your Track</h3>
        <p className={styles.subtitle}>Select the mode that best fits your career stage</p>
      </div>

      <div className={styles.switcher}>
        {[
          {
            id: 'fresher',
            title: 'Fresher',
            desc: 'Recent graduate with internship & project experience',
            tags: ['Academic Projects', 'Internships']
          },
          {
            id: 'professional',
            title: 'Professional',
            desc: 'Professional with work history and executive experience',
            tags: ['Work History', 'Executive Summary']
          },
          {
            id: 'freelancer',
            title: 'Freelancer',
            desc: 'Independent contractor specializing in client success',
            tags: ['Client Projects', 'Portfolio']
          },
          {
            id: 'academic',
            title: 'Academic',
            desc: 'Researcher or professor driven by publications',
            tags: ['Research Papers', 'Education']
          },
          {
            id: 'designer',
            title: 'Designer',
            desc: 'Creative professional with strong visual focus',
            tags: ['Portfolio', 'Experience']
          },
          {
            id: 'career-switcher',
            title: 'Career Switcher',
            desc: 'Pivoting industries with transferable skills',
            tags: ['Transferable Skills', 'Projects']
          }
        ].map((t) => (
          <button
            key={t.id}
            className={`${styles.option} ${track === t.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_TRACK', payload: t.id })}
            id={`track-${t.id}-btn`}
          >
            <div className={styles.optionContent}>
              <span className={styles.optionTitle}>{t.title}</span>
              <span className={styles.optionDesc}>{t.desc}</span>
            </div>
            <div className={styles.optionSections}>
              {t.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className={styles.indicator}>
        <div className={`${styles.indicatorDot} ${styles.active}`} />
        <span className={styles.indicatorText}>
          {track ? `${track.charAt(0).toUpperCase() + track.slice(1)} Mode` : 'Select a track'} — sections adjusted automatically
        </span>
      </div>
    </div>
  );
}
