'use client';

import { useState } from 'react';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function Skills() {
  const resumeState = useResume();
  const { skills, personalInfo, executiveSummary, workExperience } = resumeState;
  const dispatch = useResumeDispatch();
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: personalInfo?.jobTitle,
          summary: executiveSummary,
          experience: workExperience,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.skills && Array.isArray(data.skills)) {
        const existingNames = new Set(skills.map(s => s.name.toLowerCase().trim()));
        
        data.skills.forEach(skillName => {
          if (!existingNames.has(skillName.toLowerCase().trim())) {
            dispatch({
              type: 'ADD_SECTION_ITEM',
              payload: { section: 'skills', item: { name: skillName, level: 'intermediate' } },
            });
            existingNames.add(skillName.toLowerCase().trim());
          }
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to suggest skills. Try writing more in your experience section.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Skills</h3>
          <p className={styles.sectionDesc}>Your technical & soft skills</p>
        </div>
        <button 
          className="cr-btn cr-btn-ghost cr-btn-sm" 
          style={{ color: 'var(--cr-accent-primary)', padding: '4px 12px', fontSize: '0.8rem' }}
          onClick={handleSuggest}
          disabled={loading}
        >
          {loading ? '✨ Thinking...' : '✨ Suggest AI Skills'}
        </button>
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
