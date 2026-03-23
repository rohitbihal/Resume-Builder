'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './templates.module.css';
import BoldNeo from './templates/BoldNeo';
import GridMaster from './templates/GridMaster';
import VivaColor from './templates/VivaColor';
import TypeForge from './templates/TypeForge';
import InkSplash from './templates/InkSplash';
import ATSScore from './ATSScore';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/i18n';

const TEMPLATES = [
  { id: 'bold-neo', name: 'Bold Neo', component: BoldNeo, premium: false },
  { id: 'grid-master', name: 'Grid Master', component: GridMaster, premium: false },
  { id: 'viva-color', name: 'Viva Color', component: VivaColor, premium: true },
  { id: 'typeforge', name: 'TypeForge', component: TypeForge, premium: true },
  { id: 'ink-splash', name: 'Ink Splash', component: InkSplash, premium: true },
];

export default function PreviewPane({ resumeId }) {
  const resumeState = useResume();
  const { activeTemplate, theme, is_public, ...resumeData } = resumeState;
  const dispatch = useResumeDispatch();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [pageCount, setPageCount] = useState(1);
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const pdfRef = useRef(null); // hidden div for clean PDF capture (no scale wrapper)

  useEffect(() => {
    setIsClient(true);
    
    const handleAutoFit = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 32; // padding
        const resumeWidth = 800;
        if (containerWidth < resumeWidth * 0.85) {
          const newScale = containerWidth / resumeWidth;
          setScale(Math.max(0.3, Math.min(newScale, 0.85)));
        }
      }
    };

    handleAutoFit();
    window.addEventListener('resize', handleAutoFit);

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();
        
      if (profile && profile.subscription_tier === 'pro') {
        setHasPremiumAccess(true);
      }
    };
    checkAccess();

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // -5px buffer to prevent standard A4 height from spilling into page 2
        const pages = Math.max(1, Math.ceil((entry.contentRect.height - 5) / 1122.5));
        setPageCount(pages);
      }
    });

    if (previewRef.current) {
      observer.observe(previewRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleAutoFit);
      observer.disconnect();
    };
  }, []);

  const current = TEMPLATES.find(t => t.id === activeTemplate) || TEMPLATES[0];
  const TemplateComponent = current.component;

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPdf(true);
    try {
      // Collect all styles including link tags (external stylesheets)
      const stylesArr = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML);
      const linksArr = await Promise.all(
        Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
          try {
            const res = await fetch(link.href);
            return await res.text();
          } catch (e) {
            return '';
          }
        })
      );
      
      const cssString = [...stylesArr, ...linksArr].join('\n');
      const watermarkHtml = !hasPremiumAccess 
        ? '<div style="position: absolute; bottom: 10px; right: 20px; color: #a0aec0; font-size: 10px; font-family: sans-serif; z-index: 9999;">Created with CreativeResume (Free)</div>'
        : '';
      // Use the hidden pdfRef (clean, no scale transform, no page-break markers)
      const captureEl = pdfRef.current || previewRef.current;
      const htmlString = captureEl.innerHTML + watermarkHtml;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlString, css: cssString, multiPage: hasPremiumAccess }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'My'}_CreativeResume.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (confirm(`Server-side PDF generation failed: ${error.message}\n\nWould you like to use your browser's print function instead? (Select 'Save as PDF' in the print dialog)`)) {
        window.print();
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${resumeState.slug || resumeId}` 
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = translations[resumeState.language || 'en'];

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.previewHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className={styles.previewTitle}>{t.builder.preview}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)' }}>Font:</label>
            <select 
              value={theme?.font || 'Inter'}
              onChange={(e) => dispatch({ type: 'UPDATE_THEME', payload: { font: e.target.value }})}
              style={{ fontSize: '0.75rem', padding: '2px', border: '1px solid var(--cr-border)', borderRadius: '4px' }}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Georgia">Georgia</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Lora">Lora</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)' }}>Theme:</label>
            <input 
              type="color" 
              value={theme?.color || '#00B8A9'}
              onChange={(e) => dispatch({ type: 'UPDATE_THEME', payload: { color: e.target.value }})}
              style={{ width: '24px', height: '20px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              title="Change Global Theme Color"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)' }}>Zoom:</label>
            <input 
              type="range" 
              min="0.3" 
              max="1.2" 
              step="0.1" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ width: '60px', accentColor: 'var(--cr-accent-primary)' }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '35px' }}>{Math.round(scale * 100)}%</span>
          </div>
        </div>
        <ATSScore />
      </div>

      <div className={styles.templateTabs}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.templateTab} ${activeTemplate === t.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_TEMPLATE', payload: t.id })}
            id={`template-tab-${t.id}`}
          >
            {t.name}
            {t.premium && ' ✦'}
          </button>
        ))}
      </div>

      <div className={styles.previewContainer} ref={containerRef}>
        <div 
          className={styles.previewScale} 
          ref={previewRef}
          style={{ 
            transform: `scale(${scale})`, 
            marginBottom: `${(scale - 1) * 297}mm`,
            '--resume-primary': theme?.color || '#00B8A9',
            '--resume-font': theme?.font || 'Inter'
          }}
        >
          <div className={styles.previewContent}>
            <TemplateComponent />
            {!hasPremiumAccess && (
              <div className={styles.watermark}>
                PREVIEW ONLY
              </div>
            )}
          </div>
        {/* Hidden full-scale render for PDF — no transform, no page break markers */}
        <div ref={pdfRef} style={{ position: 'absolute', top: 0, left: 0, width: '210mm', visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
          <div style={{ '--resume-primary': theme?.color || '#00B8A9', '--resume-font': theme?.font || 'Inter' }}>
            <TemplateComponent />
          </div>
        </div>
          {/* Visual page break dividers */}
          {pageCount > 1 && Array.from({ length: pageCount - 1 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${(i + 1) * 1122.5}px`,
              left: 0,
              right: 0,
              height: '3px',
              background: 'repeating-linear-gradient(90deg, #FF6B6B 0, #FF6B6B 8px, transparent 8px, transparent 16px)',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <span style={{
                position: 'absolute',
                right: '8px',
                top: '-10px',
                fontSize: '9px',
                fontWeight: 700,
                color: '#FF6B6B',
                background: 'white',
                padding: '1px 4px',
                borderRadius: '3px',
                border: '1px solid #FF6B6B'
              }}>PAGE {i + 2}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.downloadArea}>
        {isClient && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Public Share Section */}
            <button 
              className={`cr-btn ${hasPremiumAccess ? 'cr-btn-primary' : 'cr-btn-outline'} cr-btn-lg`}
              style={{ width: '100%', padding: '0.8rem' }} 
              id="download-pdf-btn"
              disabled={isGeneratingPdf || (!hasPremiumAccess && !isGeneratingPdf)}
              onClick={handleDownloadPdf}
            >
              {isGeneratingPdf ? '⏳ ...' : hasPremiumAccess ? `⬇ ${t.builder.download}` : '🔒 Upgrade to Download'}
            </button>

            {!hasPremiumAccess && (
              <p style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                You are currently on the Free plan. <a href="/pricing" style={{ color: 'var(--cr-accent-primary)', fontWeight: 600 }}>Upgrade to Pro</a> to remove watermark and download.
              </p>
            )}

            {!hasPremiumAccess && pageCount > 1 && (
              <div style={{ padding: '10px', background: 'rgba(255, 217, 61, 0.1)', border: '1px solid #FFD93D', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#B38F00', fontWeight: 600 }}>
                  📄 Multi-Page Detected ({pageCount} Pages)
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)', marginTop: '4px', marginBottom: 0 }}>
                  Multi-page resumes are a Pro feature. Upgrade to successfully download large resumes without cropping.
                </p>
              </div>
            )}

            {/* Public Share Section - Moved Down */}
            {resumeId && (
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--cr-bg-secondary)', 
                border: '1px solid var(--cr-border)', 
                borderRadius: 'var(--cr-radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: is_public ? 'rgba(0, 184, 169, 0.1)' : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      {is_public ? '🌐' : '🔒'}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: 'var(--cr-text-primary)' }}>{t.builder.share}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--cr-text-muted)' }}>{is_public ? 'Visible to everyone' : 'Only you can see this'}</span>
                    </div>
                  </div>
                  <label className="cr-switch">
                    <input 
                      type="checkbox" 
                      checked={is_public || false} 
                      onChange={() => dispatch({ type: 'TOGGLE_PUBLIC' })} 
                    />
                    <span className="cr-slider"></span>
                  </label>
                </div>

                <div className="cr-input-group" style={{ gap: '6px' }}>
                  <label className="cr-label" style={{ fontSize: '0.7rem', opacity: 0.8 }}>Custom Link Name</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--cr-bg-input)', padding: '2px 8px', borderRadius: 'var(--cr-radius-md)', border: '1px solid var(--cr-border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cr-text-muted)', fontWeight: 500 }}>/share/</span>
                    <input 
                      className="cr-input" 
                      style={{ 
                        marginBottom: 0, 
                        padding: '6px 0', 
                        fontSize: '0.8rem', 
                        flex: 1, 
                        border: 'none', 
                        background: 'transparent',
                        height: 'auto',
                        fontWeight: 600
                      }} 
                      placeholder="your-name-2024"
                      value={resumeState.slug || ''}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        dispatch({ type: 'UPDATE_SLUG', payload: val });
                      }}
                    />
                  </div>
                </div>
                
                {is_public && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', animation: 'fadeIn 0.3s ease-out' }}>
                    <input 
                      readOnly 
                      value={shareUrl} 
                      className="cr-input" 
                      style={{ 
                        flex: 1, 
                        fontSize: '0.75rem', 
                        marginBottom: 0, 
                        padding: '0.6rem',
                        background: 'var(--cr-bg-card)',
                        borderStyle: 'dashed'
                      }} 
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="cr-btn cr-btn-primary cr-btn-sm" 
                      style={{ height: '38px', borderRadius: 'var(--cr-radius-md)', minWidth: '70px' }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <a 
                      href={shareUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cr-btn cr-btn-secondary cr-btn-sm"
                      style={{ height: '38px', width: '38px', padding: 0 }}
                    >
                      ↗
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
