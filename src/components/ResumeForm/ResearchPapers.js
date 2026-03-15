'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function ResearchPapers() {
  const { researchPapers } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'researchPapers', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'researchPapers',
        item: { title: '', publication: '', date: '', link: '', abstract: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'researchPapers', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Research Papers</h3>
          <p className={styles.sectionDesc}>
            List your published or in-progress academic research
          </p>
        </div>
      </div>

      {researchPapers.map((paper, index) => (
        <div key={paper.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Paper #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(paper.id)} title="Remove">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className={`cr-input-group ${styles.fieldFull}`}>
              <label className="cr-label">Paper Title *</label>
              <input className="cr-input" placeholder="Novel Approaches to Quantum Computing" value={paper.title} onChange={(e) => updateItem(paper.id, 'title', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Publication / Journal</label>
              <input className="cr-input" placeholder="Nature Physics" value={paper.publication} onChange={(e) => updateItem(paper.id, 'publication', e.target.value)} />
            </div>
             <div className="cr-input-group">
              <label className="cr-label">Date</label>
              <input className="cr-input" placeholder="August 2024" value={paper.date} onChange={(e) => updateItem(paper.id, 'date', e.target.value)} />
            </div>
            <div className={`cr-input-group ${styles.fieldFull}`}>
              <label className="cr-label">Link (DOI or URL)</label>
              <input className="cr-input" type="url" placeholder="doi.org/10..." value={paper.link} onChange={(e) => updateItem(paper.id, 'link', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <label className="cr-label">Abstract</label>
            <textarea className="cr-input cr-textarea" placeholder="Brief summary of the paper's findings..." value={paper.abstract} onChange={(e) => updateItem(paper.id, 'abstract', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Research Paper
      </button>
    </div>
  );
}
