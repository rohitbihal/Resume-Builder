'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Education() {
  const { education } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'education', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'education',
        item: { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', cgpa: '', description: '' },
      },
    });
  };

  const removeItem = (id) => {
    if (education.length <= 1) return;
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'education', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Education</h3>
          <p className={styles.sectionDesc}>Your academic background</p>
        </div>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Education #{index + 1}</span>
            {education.length > 1 && (
              <button className={styles.removeBtn} onClick={() => removeItem(edu.id)} title="Remove">✕</button>
            )}
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Institution *</label>
              <input className="cr-input" placeholder="MIT" value={edu.institution} onChange={(e) => updateItem(edu.id, 'institution', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Degree *</label>
              <input className="cr-input" placeholder="B.Tech" value={edu.degree} onChange={(e) => updateItem(edu.id, 'degree', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Field of Study</label>
              <input className="cr-input" placeholder="Computer Science" value={edu.field} onChange={(e) => updateItem(edu.id, 'field', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">GPA</label>
              <input className="cr-input" placeholder="3.8 / 4.0" value={edu.gpa} onChange={(e) => updateItem(edu.id, 'gpa', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">CGPA</label>
              <input className="cr-input" placeholder="9.5 / 10" value={edu.cgpa} onChange={(e) => updateItem(edu.id, 'cgpa', e.target.value)} />
            </div>
          </div>

          <div className={styles.dateRow} style={{ marginTop: 'var(--cr-space-md)' }}>
            <div className="cr-input-group">
              <label className="cr-label">Start Date</label>
              <input className="cr-input" type="month" value={edu.startDate} onChange={(e) => updateItem(edu.id, 'startDate', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">End Date</label>
              <input className="cr-input" type="month" value={edu.endDate} onChange={(e) => updateItem(edu.id, 'endDate', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <label className="cr-label">Description</label>
            <textarea className="cr-input cr-textarea" placeholder="Relevant coursework, achievements..." value={edu.description} onChange={(e) => updateItem(edu.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Education
      </button>
    </div>
  );
}
