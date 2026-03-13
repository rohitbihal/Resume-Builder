'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './templates.module.css';
import BoldNeo from './templates/BoldNeo';
import GridMaster from './templates/GridMaster';
import VivaColor from './templates/VivaColor';
import TypeForge from './templates/TypeForge';
import InkSplash from './templates/InkSplash';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    // Check if user has an active sub or single download purchase
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();
        
      if (subs) {
        setHasPremiumAccess(true);
      } else {
        // optionally check for single purchase
      }
    };
    checkAccess();
  }, []);

  const current = TEMPLATES.find(t => t.id === activeTemplate) || TEMPLATES[0];
  const TemplateComponent = current.component;

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>📄 Live Preview</h3>
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
        <div className={styles.previewScale}>
          <TemplateComponent />
        </div>
      </div>

      <div className={styles.downloadArea}>
        {isClient && (
          <PDFDownloadLink 
            document={<ResumePDF data={resumeData} hasWatermark={!hasPremiumAccess} />} 
            fileName={`${resumeData.personalInfo.firstName || 'My'}_CreativeResume.pdf`}
            style={{ flex: 1, textDecoration: 'none' }}
          >
            {({ blob, url, loading, error }) => (
              <button 
                className="cr-btn cr-btn-primary cr-btn-lg" 
                style={{ width: '100%' }} 
                id="download-pdf-btn"
                disabled={loading}
              >
                {loading ? '⏳ Generating PDF...' : '⬇ Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}
