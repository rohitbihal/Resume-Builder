'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function ClientProjects() {
  const { clientProjects } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'clientProjects', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: {
        section: 'clientProjects',
        item: { client: '', role: '', duration: '', description: '', link: '' },
      },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'clientProjects', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Client Projects</h3>
          <p className={styles.sectionDesc}>
            Showcase the work you've done for your freelancing clients
          </p>
        </div>
      </div>

      {clientProjects.map((proj, index) => (
        <div key={proj.id} className={styles.entryCard}>
          <div className={styles.entryHeader}>
            <span className={styles.entryTitle}>Project #{index + 1}</span>
            <button className={styles.removeBtn} onClick={() => removeItem(proj.id)} title="Remove">✕</button>
          </div>

          <div className={styles.fieldGrid}>
            <div className="cr-input-group">
              <label className="cr-label">Client / Company Name *</label>
              <input className="cr-input" placeholder="Acme Corp" value={proj.client} onChange={(e) => updateItem(proj.id, 'client', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Your Role</label>
              <input className="cr-input" placeholder="Freelance Web Developer" value={proj.role} onChange={(e) => updateItem(proj.id, 'role', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Duration</label>
              <input className="cr-input" placeholder="March 2023 - Present" value={proj.duration} onChange={(e) => updateItem(proj.id, 'duration', e.target.value)} />
            </div>
            <div className="cr-input-group">
              <label className="cr-label">Project Link</label>
              <input className="cr-input" type="url" placeholder="example.com/project" value={proj.link} onChange={(e) => updateItem(proj.id, 'link', e.target.value)} />
            </div>
          </div>

          <div className="cr-input-group" style={{ marginTop: 'var(--cr-space-md)' }}>
            <label className="cr-label">Description</label>
            <textarea className="cr-input cr-textarea" placeholder="What the project was about, what you delivered..." value={proj.description} onChange={(e) => updateItem(proj.id, 'description', e.target.value)} />
          </div>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Client Project
      </button>
    </div>
  );
}
