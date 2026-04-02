'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import ImageUpload from './ImageUpload';
import styles from './FormSection.module.css';
import { translations } from '@/lib/i18n';

export default function PersonalInfo() {
  const resume = useResume();
  const { personalInfo, language } = resume;
  const dispatch = useResumeDispatch();
  const t = translations[language || 'en'];

  const update = (field, value) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>{t.builder.personalInfo}</h3>
          <p className={styles.sectionDesc}>Your contact details and online presence</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <ImageUpload 
          value={personalInfo.profilePhoto} 
          onChange={(url) => update('profilePhoto', url)} 
        />
      </div>

      <div className={styles.fieldGrid}>
        <div className="cr-input-group">
          <label className="cr-label" htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            className="cr-input"
            type="text"
            placeholder="e.g. Jane Doe"
            value={personalInfo.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="email">Email Address *</label>
          <input
            id="email"
            className="cr-input"
            type="email"
            placeholder="e.g. jane.doe@example.com"
            value={personalInfo.email}
            onChange={(e) => update('email', e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            className="cr-input"
            type="tel"
            placeholder="e.g. +1 (555) 000-0000"
            value={personalInfo.phone}
            onChange={(e) => update('phone', e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="location">Location</label>
          <input
            id="location"
            className="cr-input"
            type="text"
            placeholder="e.g. San Francisco, CA"
            value={personalInfo.location}
            onChange={(e) => update('location', e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="linkedin">LinkedIn Profile</label>
          <input
            id="linkedin"
            className="cr-input"
            type="url"
            placeholder="linkedin.com/in/username"
            value={personalInfo.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="portfolio">Portfolio / Website</label>
          <input
            id="portfolio"
            className="cr-input"
            type="url"
            placeholder="github.com/username or yoursite.com"
            value={personalInfo.portfolio}
            onChange={(e) => update('portfolio', e.target.value)}
            maxLength={200}
          />
        </div>
      </div>
    </div>
  );
}
