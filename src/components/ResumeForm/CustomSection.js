'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function CustomSection() {
  const { customSections } = useResume();
  const dispatch = useResumeDispatch();

  const addSection = () => {
    dispatch({ type: 'ADD_CUSTOM_SECTION' });
  };

  const removeSection = (id) => {
    dispatch({ type: 'REMOVE_CUSTOM_SECTION', payload: id });
  };

  const updateTitle = (id, title) => {
    dispatch({ type: 'UPDATE_CUSTOM_SECTION_TITLE', payload: { id, title } });
  };

  const addItem = (sectionId) => {
    dispatch({ type: 'ADD_CUSTOM_SECTION_ITEM', payload: { sectionId } });
  };

  const updateItem = (sectionId, itemId, content) => {
    dispatch({ type: 'UPDATE_CUSTOM_SECTION_ITEM', payload: { sectionId, itemId, content } });
  };

  const removeItem = (sectionId, itemId) => {
    dispatch({ type: 'REMOVE_CUSTOM_SECTION_ITEM', payload: { sectionId, itemId } });
  };

  return (
    <>
      {customSections.map((section) => (
        <div key={section.id} className={styles.formSection} style={{ position: 'relative' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✨</span>
            <div className={styles.sectionMeta} style={{ flex: 1 }}>
              <input
                className={styles.customTitleInput}
                type="text"
                value={section.title}
                onChange={(e) => updateTitle(section.id, e.target.value)}
                placeholder="Section Title"
              />
              <p className={styles.sectionDesc}>Custom section with rich-text bullets</p>
            </div>
            <div className={styles.customSectionActions}>
              <button
                className={`cr-btn cr-btn-danger cr-btn-sm`}
                onClick={() => removeSection(section.id)}
              >
                Remove Section
              </button>
            </div>
          </div>

          {section.items.map((item, index) => (
            <div key={item.id} className={styles.entryCard}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>Bullet #{index + 1}</span>
                {section.items.length > 1 && (
                  <button className={styles.removeBtn} onClick={() => removeItem(section.id, item.id)} title="Remove">✕</button>
                )}
              </div>
              <div className="cr-input-group">
                <textarea
                  className="cr-input cr-textarea"
                  placeholder="Add a bullet point..."
                  value={item.content}
                  onChange={(e) => updateItem(section.id, item.id, e.target.value)}
                />
              </div>
            </div>
          ))}

          <button className={styles.addBtn} onClick={() => addItem(section.id)}>
            <span>+</span> Add Bullet Point
          </button>
        </div>
      ))}

      <button
        className="cr-btn cr-btn-secondary"
        onClick={addSection}
        id="add-custom-section-btn"
        style={{ width: '100%', borderStyle: 'dashed' }}
      >
        ✨ Add Custom Section
      </button>
    </>
  );
}
