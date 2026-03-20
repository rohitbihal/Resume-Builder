'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import styles from './CoverLetter.module.css';

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchResumes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('resumes')
          .select('id, title, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        setResumes(data || []);
        if (data && data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      }
    }
    fetchResumes();
  }, []);

  const handleGenerate = async () => {
    if (!selectedResumeId || !jobDescription) {
      alert('Please select a resume and provide a job description.');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch full resume data
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', selectedResumeId)
        .single();

      // 2. Call AI API
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setGeneratedLetter(result.coverLetter);
    } catch (err) {
      console.error('Error generating letter:', err);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedLetter) return;

    setDownloading(true);
    try {
      const html = `
        <div style="padding: 4rem; font-family: 'Inter', sans-serif; line-height: 1.6; color: #334155; font-size: 11pt; white-space: pre-line;">
          ${generatedLetter}
        </div>
      `;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cover_Letter.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Error:', err);
      alert('Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>AI Cover Letter Generator</h1>
          <p className={styles.subtitle}>Create a perfectly tailored cover letter in seconds.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formCard}>
            <div className={styles.section}>
              <label className={styles.label}>Select Base Resume</label>
              <select 
                className={styles.resumeSelect}
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
                {resumes.length === 0 && <option value="">No resumes found</option>}
              </select>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Job Description</label>
              <textarea 
                className={styles.textarea}
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            </div>

            <button 
              className={`cr-btn cr-btn-primary cr-btn-lg`}
              style={{ width: '100%' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Writing your letter...' : '✍️ Generate with AI'}
            </button>
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span style={{ fontWeight: 600 }}>Letter Preview</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="cr-btn cr-btn-outline cr-btn-sm"
                  onClick={handleDownload}
                  disabled={!generatedLetter || downloading}
                >
                  {downloading ? 'Preparing...' : '💾 Download PDF'}
                </button>
              </div>
            </div>

            <div className={styles.previewContent}>
              {generatedLetter ? (
                <textarea 
                  className={styles.letterEditor}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                />
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <p>Your generated cover letter will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
