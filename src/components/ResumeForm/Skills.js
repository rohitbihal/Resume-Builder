'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Skills() {
  const { skills } = useResume();
  const dispatch = useResumeDispatch();

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_SECTION_ITEM',
      payload: { section: 'skills', id, data: { [field]: value } },
    });
  };

  const addItem = () => {
    dispatch({
      type: 'ADD_SECTION_ITEM',
      payload: { section: 'skills', item: { name: '', level: 'intermediate' } },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_SECTION_ITEM', payload: { section: 'skills', id } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Skills</h3>
          <p className={styles.sectionDesc}>Your technical & soft skills</p>
        </div>
      </div>

      {skills.map((skill) => (
        <div key={skill.id} className={styles.skillGrid}>
          <div className="cr-input-group">
            <input className="cr-input" placeholder="e.g. React, Python, Leadership..." value={skill.name} onChange={(e) => updateItem(skill.id, 'name', e.target.value)} />
          </div>
          <select className={styles.levelSelect} value={skill.level} onChange={(e) => updateItem(skill.id, 'level', e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <button className={styles.removeBtn} onClick={() => removeItem(skill.id)} title="Remove">✕</button>
        </div>
      ))}

      <button className={styles.addBtn} onClick={addItem}>
        <span>+</span> Add Skill
      </button>
    </div>
  );
}
