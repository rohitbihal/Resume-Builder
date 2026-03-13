'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './TrackSwitcher.module.css';

export default function TrackSwitcher() {
  const { track } = useResume();
  const dispatch = useResumeDispatch();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.icon}>🎯</span>
        <h3 className={styles.title}>Choose Your Track</h3>
        <p className={styles.subtitle}>Select the mode that best fits your career stage</p>
      </div>

      <div className={styles.switcher}>
        <button
          className={`${styles.option} ${track === 'fresher' ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'SET_TRACK', payload: 'fresher' })}
          id="track-fresher-btn"
        >
          <div className={styles.optionIcon}>🎓</div>
          <div className={styles.optionContent}>
            <span className={styles.optionTitle}>Fresher</span>
            <span className={styles.optionDesc}>Recent graduate or student with internship & project experience</span>
          </div>
          <div className={styles.optionSections}>
            <span className={styles.tag}>Academic Projects</span>
            <span className={styles.tag}>Internships</span>
            <span className={styles.tag}>Skills</span>
          </div>
        </button>

        <button
          className={`${styles.option} ${track === 'experienced' ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'SET_TRACK', payload: 'experienced' })}
          id="track-experienced-btn"
        >
          <div className={styles.optionIcon}>💼</div>
          <div className={styles.optionContent}>
            <span className={styles.optionTitle}>Experienced</span>
            <span className={styles.optionDesc}>Professional with work history and executive-level experience</span>
          </div>
          <div className={styles.optionSections}>
            <span className={styles.tag}>Work History</span>
            <span className={styles.tag}>Executive Summary</span>
            <span className={styles.tag}>Skills</span>
          </div>
        </button>
      </div>

      <div className={styles.indicator}>
        <div className={`${styles.indicatorDot} ${styles.active}`} />
        <span className={styles.indicatorText}>
          {track === 'fresher' ? 'Fresher Mode' : 'Experienced Mode'} — sections adjusted automatically
        </span>
      </div>
    </div>
  );
}
