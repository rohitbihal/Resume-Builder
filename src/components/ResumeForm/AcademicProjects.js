'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function AcademicProjects() {
  const { academicProjects, track } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'academicProjects', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'academicProjects',
        item: { name: '', technologies: '', link: '', description: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'academicProjects', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Academic Projects</h3>
          <p className={styles.sectionDesc}>
            {track === 'fresher' ? 'Showcase your key projects — this is a primary section for freshers' : 'Highlight notable academic or personal projects'}
          </p>
        </div>
        {track === 'experienced' && <span className={styles.optionalBadge}>Optional</span>}
      </div>

      {academicProjects.map((proj, index) => (
        <div key={proj.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Project #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(proj.id)} title="Remove">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className={`cr-input-group ${styles.fieldFull}`}>
              <label className="cr-label">Project Name *</label>
              <input className="cr-input" placeholder="AI Chat Application" value={proj.name} onChange={(e) => updateItem(proj.id, 'name', e.target.value)} />
            </div>
            <div className={`cr-input-group ${styles.fieldFull}`}>
              <label className="cr-label">Technologies Used</label>
              <input className="cr-input" placeholder="React, Node.js, GPT-4" value={proj.technologies} onChange={(e) => updateItem(proj.id, 'technologies', e.target.value)} />
            </div>
            <div className={`cr-input-group ${styles.fieldFull}`}>
              <label className="cr-label">Project Link</label>
              <input className="cr-input" type="url" placeholder="github.com/you/project" value={proj.link} onChange={(e) => updateItem(proj.id, 'link', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <label className="cr-label">Description</label>
            <textarea className="cr-input cr-textarea" rows={5} placeholder="What the project does, your contributions, and key results..." value={proj.description} onChange={(e) => updateItem(proj.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Project
      </button>
    </div>
  );
}
