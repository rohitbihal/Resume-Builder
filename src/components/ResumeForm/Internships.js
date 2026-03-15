'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Internships() {
  const { internships } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'internships', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'internships',
        item: { company: '', role: '', startDate: '', endDate: '', description: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'internships', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Internships & Freelance</h3>
          <p className={styles.sectionDesc}>Your practical industry experience</p>
        </div>
        <span className={styles.optionalBadge}>Optional</span>
      </div>

      {internships.map((intern, index) => (
        <div key={intern.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Internship #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(intern.id)} title="Remove">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Company / Client</label>
              <input className="cr-input" placeholder="Startup XYZ" value={intern.company} onChange={(e) => updateItem(intern.id, 'company', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Role</label>
              <input className="cr-input" placeholder="Frontend Intern" value={intern.role} onChange={(e) => updateItem(intern.id, 'role', e.target.value)} />
            </div>
          </div>

          <div className={styles.dateRow} style={{ marginTop: 'var(--cr-space-md)' }}>
            <div className="cr-input-group">
              <label className="cr-label">Start Date</label>
              <input className="cr-input" type="month" value={intern.startDate} onChange={(e) => updateItem(intern.id, 'startDate', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">End Date</label>
              <input className="cr-input" type="month" value={intern.endDate} onChange={(e) => updateItem(intern.id, 'endDate', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <label className="cr-label">Description</label>
            <textarea className="cr-input cr-textarea" placeholder="What you worked on, technologies used..." value={intern.description} onChange={(e) => updateItem(intern.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Internship
      </button>
    </div>
  );
}
