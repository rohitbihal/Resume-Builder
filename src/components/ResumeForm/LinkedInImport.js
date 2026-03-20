'use client';

import { useState } from 'react';
import { useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function LinkedInImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useResumeDispatch();

  const [profileUrl, setProfileUrl] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    if (!profileUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/parse-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: profileUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to parse profile link. Please ensure it is a valid public profile.');
      }

      const data = await response.json();
      
      // Dispatch the parsed data to the context
      dispatch({ type: 'LOAD_RESUME', payload: { ...data, onboardingComplete: true } });
      
      alert('Successfully imported data from profile link!');
      setProfileUrl('');
    } catch (err) {
      console.error('Profile Import error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sectionCard} style={{ marginBottom: '2rem', border: '1px dashed var(--cr-accent-primary)', background: 'rgba(37, 99, 235, 0.02)' }}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>AI Profile Link Import</h3>
      </div>
      <div className={styles.sectionContent} style={{ padding: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--cr-text-muted)', marginBottom: '1.25rem', textAlign: 'center' }}>
          Import your details instantly from a public profile link (e.g., LinkedIn, Portfolio).
        </p>
        
        <form onSubmit={handleImport} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="url"
            placeholder="https://linkedin.com/in/username"
            className="cr-input"
            style={{ flex: 1, marginBottom: 0 }}
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            disabled={loading}
            required
          />
          <button 
            type="submit"
            className="cr-btn cr-btn-primary" 
            disabled={loading || !profileUrl}
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? '🪄 Importing...' : 'Import'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'var(--cr-error)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
