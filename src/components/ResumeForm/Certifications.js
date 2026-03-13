'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Certifications() {
  const { certifications } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'certifications', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'certifications',
        item: { name: '', issuer: '', date: '', link: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'certifications', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>🏆</span>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Certifications</h3>
          <p className={styles.sectionDesc}>Professional certifications and credentials</p>
        </div>
        <span className={styles.optionalBadge}>Optional</span>
      </div>

      {certifications.map((cert, index) => (
        <div key={cert.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Certificate #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(cert.id)} title="Remove">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Certification Name</label>
              <input className="cr-input" placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => updateItem(cert.id, 'name', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Issuing Organization</label>
              <input className="cr-input" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => updateItem(cert.id, 'issuer', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Date</label>
              <input className="cr-input" type="month" value={cert.date} onChange={(e) => updateItem(cert.id, 'date', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Credential Link</label>
              <input className="cr-input" type="url" placeholder="credly.com/badges/..." value={cert.link} onChange={(e) => updateItem(cert.id, 'link', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Certification
      </button>
    </div>
  );
}
