'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function WorkExperience() {
  const { workExperience } = useResume();
  const dispatch = useResumeDispatch();

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
          <h3 className={styles.sectionName}>Professional Work History</h3>
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
              <label className="cr-label">Company *</label>
              <input className="cr-input" placeholder="Google" value={exp.company} onChange={(e) => updateItem(exp.id, 'company', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Job Title *</label>
              <input className="cr-input" placeholder="Senior Software Engineer" value={exp.title} onChange={(e) => updateItem(exp.id, 'title', e.target.value)} />
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
            <label className="cr-label">Description & Achievements</label>
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
