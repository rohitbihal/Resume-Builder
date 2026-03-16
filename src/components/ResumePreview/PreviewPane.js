'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './templates.module.css';
import BoldNeo from './templates/BoldNeo';
import GridMaster from './templates/GridMaster';
import VivaColor from './templates/VivaColor';
import TypeForge from './templates/TypeForge';
import InkSplash from './templates/InkSplash';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const TEMPLATES = [
  { id: 'bold-neo', name: 'Bold Neo', component: BoldNeo, premium: false },
  { id: 'grid-master', name: 'Grid Master', component: GridMaster, premium: false },
  { id: 'viva-color', name: 'Viva Color', component: VivaColor, premium: true },
  { id: 'typeforge', name: 'TypeForge', component: TypeForge, premium: true },
  { id: 'ink-splash', name: 'Ink Splash', component: InkSplash, premium: true },
];

export default function PreviewPane() {
  const resumeState = useResume();
  const { activeTemplate, ...resumeData } = resumeState;
  const dispatch = useResumeDispatch();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    // Check if user has an active sub or single download purchase
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
      const htmlString = previewRef.current.innerHTML + watermarkHtml;

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlString, css: cssString }),
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

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Live Preview</h3>
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

      <div className={styles.previewContainer}>
        <div className={styles.previewScale} ref={previewRef}>
          <TemplateComponent />
        </div>
      </div>

      <div className={styles.downloadArea}>
        {isClient && (
          <button 
            className="cr-btn cr-btn-primary cr-btn-lg" 
            style={{ width: '100%' }} 
            id="download-pdf-btn"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
          >
            {isGeneratingPdf ? '⏳ Generating PDF...' : '⬇ Download PDF'}
          </button>
        )}
      </div>
    </div>
  );
}
