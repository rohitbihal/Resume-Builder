'use client';

import { useState } from 'react';
import { useResumeDispatch } from '@/context/ResumeContext';
import styles from './DraggableList.module.css'; // Reusing styles for consistency or creating specific ones

export default function LinkedInImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useResumeDispatch();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-linkedin', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse LinkedIn profile. Please ensure it is a valid LinkedIn PDF.');
      }

      const data = await response.json();
      
      // Dispatch the parsed data to the context
      dispatch({ type: 'LOAD_RESUME', payload: data });
      
      alert('Successfully imported data from LinkedIn PDF!');
    } catch (err) {
      console.error('LinkedIn Import error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className={styles.sectionCard} style={{ marginBottom: '2rem', border: '1px dashed var(--cr-accent-primary)', background: 'rgba(37, 99, 235, 0.05)' }}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>✨ AI LinkedIn Import</h3>
      </div>
      <div className={styles.sectionContent} style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--cr-text-muted)', marginBottom: '1rem' }}>
          Import your LinkedIn profile instantly. Upload the "Save to PDF" file from your LinkedIn profile.
        </p>
        
        <label className="cr-btn cr-btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {loading ? '⏳ Processing...' : '📤 Upload LinkedIn PDF'}
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            disabled={loading}
          />
        </label>

        {error && (
          <p style={{ color: 'var(--cr-error)', fontSize: '0.8rem', marginTop: '1rem' }}>
            ❌ {error}
          </p>
        )}
      </div>
    </div>
  );
}
