'use client';

import { ResumeProvider } from '@/context/ResumeContext';
import BoldNeo from '@/components/ResumePreview/templates/BoldNeo';
import GridMaster from '@/components/ResumePreview/templates/GridMaster';
import InkSplash from '@/components/ResumePreview/templates/InkSplash';
import TypeForge from '@/components/ResumePreview/templates/TypeForge';
import VivaColor from '@/components/ResumePreview/templates/VivaColor';
import { translations } from '@/lib/i18n';
import styles from './SharePage.module.css';

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

  return (
    <div className={styles.shareWrapper}>
      <nav className={styles.shareNav}>
        <div className={styles.navContent}>
          <span className={styles.logo}>Creative<span>Resume</span></span>
          <a href="/" className="cr-btn cr-btn-primary cr-btn-sm">{t.share.createOwn}</a>
        </div>
      </nav>

      <div className={styles.resumeContainer}>
        <div 
          className={styles.resumeShadow}
          style={{
            '--resume-primary': resumeData.theme?.color || '#00B8A9',
            '--resume-font': resumeData.theme?.font || 'Inter'
          }}
        >
          <ResumeProvider initialData={resumeData}>
            <TemplateComponent />
          </ResumeProvider>
        </div>
      </div>

      <footer className={styles.shareFooter}>
        <p>{t.share.verified}</p>
      </footer>
    </div>
  );
}
