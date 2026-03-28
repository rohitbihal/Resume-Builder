'use client';

import { useState } from 'react';
import { useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function LinkedInImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useResumeDispatch();

  const [importMethod, setImportMethod] = useState('url'); // 'url' or 'pdf'
  const [profileUrl, setProfileUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  const [parsedData, setParsedData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showExportGuide, setShowExportGuide] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (importMethod === 'url' && !profileUrl) return;
    if (importMethod === 'pdf' && !pdfFile) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      if (importMethod === 'url') {
        response = await fetch('/api/parse-linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: profileUrl }),
        });
      } else {
        const formData = new FormData();
        formData.append('file', pdfFile);
        response = await fetch('/api/parse-linkedin', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import profile.');
      }
      
      setParsedData(data);
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Profile Import error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    // Preserve existing theme, activeTemplate, settings
    dispatch({ 
      type: 'LOAD_RESUME', 
      payload: { ...parsedData, onboardingComplete: true } 
    });
    dispatch({ type: 'SET_IMPORTED_HIGHLIGHT', payload: true });
    
    // Auto-clear highlight after 10 seconds
    setTimeout(() => {
      dispatch({ type: 'SET_IMPORTED_HIGHLIGHT', payload: false });
    }, 10000);

    alert('Profile imported successfully. Please review and edit your details before saving.');
    setShowPreviewModal(false);
    setProfileUrl('');
    setPdfFile(null);
    setParsedData(null);
  };

  return (
    <div className={styles.sectionCard} style={{ marginBottom: '2rem', border: '1px dashed var(--cr-accent-primary)', background: 'rgba(37, 99, 235, 0.02)' }}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>AI Profile Import</h3>
      </div>
      <div className={styles.sectionContent} style={{ padding: '1.5rem' }}>
        
        {/* Toggle Method */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <button 
            type="button"
            onClick={() => setImportMethod('url')}
            className={`cr-btn ${importMethod === 'url' ? 'cr-btn-primary' : 'cr-btn-secondary'} cr-btn-sm`}
            style={{ borderRadius: 'var(--cr-radius-full)' }}
          >
            Enter LinkedIn URL
          </button>
          <button 
            type="button"
            onClick={() => setImportMethod('pdf')}
            className={`cr-btn ${importMethod === 'pdf' ? 'cr-btn-primary' : 'cr-btn-secondary'} cr-btn-sm`}
            style={{ borderRadius: 'var(--cr-radius-full)' }}
          >
            Upload LinkedIn PDF
          </button>
        </div>

        <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {importMethod === 'url' ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="file"
                  accept="application/pdf"
                  className="cr-input"
                  style={{ flex: 1, marginBottom: 0, padding: '7px' }}
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  disabled={loading}
                  required
                />
                <button 
                  type="submit"
                  className="cr-btn cr-btn-primary" 
                  disabled={loading || !pdfFile}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {loading ? '🪄 Parsing...' : 'Parse PDF'}
                </button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button" 
                  className="cr-btn-ghost" 
                  style={{ fontSize: '0.8rem', textDecoration: 'underline', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setShowExportGuide(true)}
                >
                  How to export LinkedIn profile to PDF?
                </button>
              </div>
            </div>
          )}
        </form>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(225, 112, 85, 0.1)', border: '1px solid rgba(225, 112, 85, 0.3)', borderRadius: 'var(--cr-radius-md)' }}>
            <p style={{ color: 'var(--cr-danger)', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.5', margin: 0 }}>
              {error}
            </p>
            {error.includes('PDF') && importMethod === 'url' && (
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <button 
                  type="button"
                  className="cr-btn cr-btn-primary cr-btn-sm"
                  onClick={() => setImportMethod('pdf')}
                >
                  Switch to PDF Upload
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Export Guide Modal */}
      {showExportGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="cr-card cr-glass" style={{ maxWidth: '400px', width: '90%', background: 'var(--cr-bg-card)' }}>
            <h3 style={{ marginBottom: '1rem' }}>How to Export LinkedIn PDF</h3>
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li><strong>Step 1:</strong> Go to your LinkedIn profile.</li>
              <li><strong>Step 2:</strong> Click the <strong>"More"</strong> button below your profile picture.</li>
              <li><strong>Step 3:</strong> Select <strong>"Save to PDF"</strong>.</li>
              <li><strong>Step 4:</strong> Upload the downloaded PDF here.</li>
            </ol>
            <button className="cr-btn cr-btn-primary" style={{ width: '100%' }} onClick={() => setShowExportGuide(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* Preview Confirmation Modal */}
      {showPreviewModal && parsedData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="cr-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', background: 'var(--cr-bg-card)' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Import Preview</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--cr-text-muted)', marginBottom: '1.5rem' }}>
              Review the data we extracted. You can edit all these fields later in the editor.
            </p>

            <div style={{ padding: '1rem', background: 'var(--cr-bg-input)', borderRadius: 'var(--cr-radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <strong>Name:</strong> {parsedData.personalInfo?.fullName}<br/>
              <strong>Email:</strong> {parsedData.personalInfo?.email}<br/>
              <strong>Experience:</strong> {parsedData.workExperience?.length || 0} roles found<br/>
              <strong>Education:</strong> {parsedData.education?.length || 0} degrees found<br/>
              <strong>Skills:</strong> {parsedData.skills?.length || 0} skills found<br/>
              <strong>Projects:</strong> {parsedData.academicProjects?.length || 0} found<br/>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="cr-btn cr-btn-secondary" 
                onClick={() => { setShowPreviewModal(false); setParsedData(null); }}
              >
                Cancel
              </button>
              <button 
                className="cr-btn cr-btn-primary" 
                onClick={handleConfirmImport}
              >
                Approve & Fill Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
