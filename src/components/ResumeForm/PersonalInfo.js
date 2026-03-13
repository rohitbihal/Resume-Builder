'use client';

import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import styles from './FormSection.module.css';

export default function PersonalInfo() {
  const { personalInfo } = useResume();
  const dispatch = useResumeDispatch();

  const update = (field, value) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: { [field]: value } });
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>👤</span>
        <div className={styles.sectionMeta}>
          <h3 className={styles.sectionName}>Personal Information</h3>
          <p className={styles.sectionDesc}>Your contact details and online presence</p>
        </div>
      </div>

      <div className={styles.fieldGrid}>
        <div className="cr-input-group">
          <label className="cr-label" htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            className="cr-input"
            type="text"
            placeholder="John Doe"
            value={personalInfo.fullName}
            onChange={(e) => update('fullName', e.target.value)}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="email">Email *</label>
          <input
            id="email"
            className="cr-input"
            type="email"
            placeholder="john@example.com"
            value={personalInfo.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            className="cr-input"
            type="tel"
            placeholder="+91 98765 43210"
            value={personalInfo.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="location">Location</label>
          <input
            id="location"
            className="cr-input"
            type="text"
            placeholder="Mumbai, India"
            value={personalInfo.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="linkedin">LinkedIn</label>
          <input
            id="linkedin"
            className="cr-input"
            type="url"
            placeholder="linkedin.com/in/johndoe"
            value={personalInfo.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
          />
        </div>

        <div className="cr-input-group">
          <label className="cr-label" htmlFor="portfolio">Portfolio / Website</label>
          <input
            id="portfolio"
            className="cr-input"
            type="url"
            placeholder="johndoe.dev"
            value={personalInfo.portfolio}
            onChange={(e) => update('portfolio', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
