'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function ExecutiveSummary() {
  const { executiveSummary } = useResume();
  const dispatch = useResumeDispatch();

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Executive Summary</h3>
          <p className={styles.sectionDesc}>A powerful overview of your professional profile</p>
        </div>
      </div>

      <div className="cr-input-group">
        <label className="cr-label">Professional Summary</label>
        <textarea
          className="cr-input cr-textarea"
          style={{ minHeight: '140px' }}
          placeholder="Results-driven software engineer with 8+ years of experience in building scalable web applications. Led cross-functional teams of 10+ members, delivering projects that increased revenue by 40%..."
          value={executiveSummary}
          onChange={(e) => dispatch({ type: 'UPDATE_EXECUTIVE_SUMMARY', payload: e.target.value })}
        />
      </div>

      <div style={{ marginTop: 'var(--cr-space-md)', display: 'flex', gap: 'var(--cr-space-sm)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)' }}>💡 Tips:</span>
        {['Quantify achievements', 'Use action verbs', 'Keep it 3-4 sentences', 'Tailor to the role'].map((tip) => (
          <span key={tip} style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            background: 'rgba(108, 92, 231, 0.08)',
            border: '1px solid rgba(108, 92, 231, 0.15)',
            borderRadius: 'var(--cr-radius-full)',
            color: 'var(--cr-accent-secondary)',
          }}>
            {tip}
          </span>
        ))}
      </div>
    </div>
  );
}
