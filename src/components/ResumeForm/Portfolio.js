'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Portfolio() {
  const { portfolio } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'portfolio', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'portfolio',
        item: { title: '', image: null, link: '', description: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'portfolio', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Portfolio</h3>
          <p className={styles.sectionDesc}>
            Showcase your design work and creative portfolio pieces
          </p>
        </div>
      </div>

      {portfolio.map((item, index) => (
        <div key={item.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Portfolio Piece #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(item.id)} title="Remove" aria-label="Remove entry">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Title *</label>
              <input className="cr-input" placeholder="Brand Identity for Startup" value={item.title} onChange={(e) => updateItem(item.id, 'title', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Link</label>
              <input className="cr-input" type="url" placeholder="dribbble.com/shot/..." value={item.link} onChange={(e) => updateItem(item.id, 'link', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
             <label className="cr-label">Description</label>
             <textarea className="cr-input cr-textarea" placeholder="Describe the design challenge and your solution..." value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Portfolio Piece
      </button>
    </div>
  );
}
