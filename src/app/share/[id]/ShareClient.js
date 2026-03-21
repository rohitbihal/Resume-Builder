'use client';

import { ResumeProvider } from '@/context/ResumeContext';
import BoldNeo from '@/components/ResumePreview/templates/BoldNeo';
import GridMaster from '@/components/ResumePreview/templates/GridMaster';
import InkSplash from '@/components/ResumePreview/templates/InkSplash';
import TypeForge from '@/components/ResumePreview/templates/TypeForge';
import VivaColor from '@/components/ResumePreview/templates/VivaColor';
import { translations } from '@/lib/i18n';
import styles from './SharePage.module.css';
import { useState, useEffect, useRef } from 'react';

const TEMPLATE_COMPONENTS = {
  'bold-neo': BoldNeo,
  'grid-master': GridMaster,
  'ink-splash': InkSplash,
  'typeforge': TypeForge,
  'viva-color': VivaColor,
};

export default function ShareClient({ resumeData }) {
  const t = translations[resumeData.language || 'en'];
  const TemplateComponent = TEMPLATE_COMPONENTS[resumeData.activeTemplate] || BoldNeo;
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const resumeRef = useRef(null);
  const [resumeHeight, setResumeHeight] = useState(1123);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const resumeWidth = 800;
        if (containerWidth < resumeWidth) {
          setScale(containerWidth / resumeWidth);
        } else {
          setScale(1);
        }
      }
      if (resumeRef.current) {
        setResumeHeight(resumeRef.current.offsetHeight);
      }
    };

    handleResize();
    const timer = setTimeout(handleResize, 500); // Small delay to let template render
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.shareWrapper}>
      <nav className={styles.shareNav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>Creative<span>Resume</span></span>
          <a href="/" className="cr-btn cr-btn-primary cr-btn-sm">{t.share.createOwn}</a>
        </div>
      </nav>

      <div className={styles.resumeContainer} ref={containerRef}>
        <div 
          className={styles.resumeShadow}
          style={{
            '--resume-primary': resumeData.theme?.color || '#00B8A9',
            '--resume-font': resumeData.theme?.font || 'Inter',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            height: scale < 1 ? 'min-content' : 'auto'
          }}
        >
          <div style={{ width: '100%', height: '100%' }} ref={resumeRef}>
            <ResumeProvider initialData={resumeData}>
              <TemplateComponent />
            </ResumeProvider>
          </div>
        </div>
      </div>

      <footer className={styles.shareFooter} style={{ 
        marginTop: scale < 1 ? `calc(${resumeHeight}px * ${scale} - ${resumeHeight}px)` : '0' 
      }}>
        <p>{t.share.verified}</p>
        <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>Powered by CreativeResume.io</p>
      </footer>
    </div>
  );
}
