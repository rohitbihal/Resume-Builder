'use client';

import { useState } from 'react';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';
import { translations } from '@/lib/i18n';

export default function WorkExperience() {
  const resume = useResume();
  const { workExperience, language } = resume;
  const dispatch = useResumeDispatch();
  const t = translations[language || 'en'];
  const [loadingId, setLoadingId] = useState(null);

  const handleEnhance = async (exp) => {
    if (!exp.description || exp.description.trim() === '') {
      alert('Please write a brief draft description first.');
      return;
    }
    
    setLoadingId(exp.id);
    try {
      const res = await fetch('/api/enhance-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: exp.description, 
          company: exp.company, 
          title: exp.title 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enhance text');
      
      updateItem(exp.id, 'description', data.enhancedText);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'workExperience', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'workExperience',
        item: { company: '', title: '', startDate: '', endDate: '', current: false, description: '' },
      },
    });
  };

  const removeItem = (id) => {
    if (workExperience.length <= 1) return;
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'workExperience', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>{t.builder.workExperience}</h3>
          <p className={styles.sectionDesc}>Your professional experience and achievements</p>
        </div>
      </div>

      {workExperience.map((exp, index) => (
        <div key={exp.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Position #{index + 1}</span>
            {workExperience.length > 1 && (
              <button className={styles.removeBtn} onClick={() => removeItem(exp.id)} title="Remove">✕</button>
            )}
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Company Name *</label>
              <input className="cr-input" placeholder="e.g. Google, Inc." value={exp.company} onChange={(e) => updateItem(exp.id, 'company', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Job Title *</label>
              <input className="cr-input" placeholder="e.g. Senior Software Engineer" value={exp.title} onChange={(e) => updateItem(exp.id, 'title', e.target.value)} />
            </div>
          </div>

          <div className={styles.dateRow} style={{ marginTop: 'var(--cr-space-md)' }}>
            <div className="cr-input-group">
              <label className="cr-label">Start Date</label>
              <input className="cr-input" type="month" value={exp.startDate} onChange={(e) => updateItem(exp.id, 'startDate', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">End Date</label>
              <input className="cr-input" type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateItem(exp.id, 'endDate', e.target.value)} />
              <div className={styles.checkboxRow}>
                <input type="checkbox" id={`current-${exp.id}`} checked={exp.current} onChange={(e) => updateItem(exp.id, 'current', e.target.checked)} />
                <label htmlFor={`current-${exp.id}`}>Currently working here</label>
              </div>
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
              <label className="cr-label" style={{ marginBottom: 0 }}>Description & Achievements</label>
              <button 
                className="cr-btn cr-btn-ghost cr-btn-sm" 
                style={{ color: 'var(--cr-accent-primary)', padding: '2px 8px', fontSize: '0.75rem', height: '28px' }}
                onClick={() => handleEnhance(exp)}
                disabled={loadingId === exp.id}
              >
                {loadingId === exp.id ? '✨ ...' : `✨ ${t.builder.enhance}`}
              </button>
            </div>
            <textarea className="cr-input cr-textarea" placeholder="• Led a team of 5 engineers to deliver..." value={exp.description} onChange={(e) => updateItem(exp.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Work Experience
      </button>
    </div>
  );
}
