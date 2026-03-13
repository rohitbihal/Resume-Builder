'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function GridMaster() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className={`${styles.resumePage} ${styles.gridMaster}`}>
      {/* Sidebar */}
      <div className={styles.gmSidebar}>
        <div className={styles.gmSideSection}>
          <h3 className={styles.gmSideTitle}>Contact</h3>
          {personalInfo.email && <div className={styles.gmContactItem}>✉ {personalInfo.email}</div>}
          {personalInfo.phone && <div className={styles.gmContactItem}>📱 {personalInfo.phone}</div>}
          {personalInfo.location && <div className={styles.gmContactItem}>📍 {personalInfo.location}</div>}
          {personalInfo.linkedin && <div className={styles.gmContactItem}>🔗 {personalInfo.linkedin}</div>}
          {personalInfo.portfolio && <div className={styles.gmContactItem}>🌐 {personalInfo.portfolio}</div>}
        </div>

        {skills.some(s => s.name) && (
          <div className={styles.gmSideSection}>
            <h3 className={styles.gmSideTitle}>Skills</h3>
            <div className={styles.gmSkillTags}>
              {skills.filter(s => s.name).map(skill => (
                <span key={skill.id} className={styles.gmTag}>{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {certifications.some(c => c.name) && (
          <div className={styles.gmSideSection}>
            <h3 className={styles.gmSideTitle}>Certifications</h3>
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} className={styles.gmCertEntry}>
                <strong>{cert.name}</strong><br/>
                <span style={{ fontSize: '7.5pt', opacity: 0.8 }}>{cert.issuer}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className={styles.gmMain}>
        <h1 className={styles.gmName}>{personalInfo.fullName || 'Your Name'}</h1>
        <p className={styles.gmSubtitle}>{personalInfo.email}</p>

        {track === 'experienced' && executiveSummary && (
          <div className={styles.gmMainSection}>
            <h2 className={styles.gmMainTitle}>Professional Summary</h2>
            <p className={styles.gmEntryText}>{executiveSummary}</p>
          </div>
        )}

        {track === 'experienced' && workExperience.some(e => e.company) && (
          <div className={styles.gmMainSection}>
            <h2 className={styles.gmMainTitle}>Experience</h2>
            {workExperience.filter(e => e.company).map(exp => (
              <div key={exp.id} className={styles.gmEntry}>
                <div className={styles.gmEntryHead}>
                  <span className={styles.gmEntryTitle}>{exp.title}</span>
                  <span className={styles.gmEntryDate}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <div className={styles.gmEntryCompany}>{exp.company}</div>
                {exp.description && <p className={styles.gmEntryText}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {track === 'fresher' && internships.some(i => i.company) && (
          <div className={styles.gmMainSection}>
            <h2 className={styles.gmMainTitle}>Internships</h2>
            {internships.filter(i => i.company).map(intern => (
              <div key={intern.id} className={styles.gmEntry}>
                <div className={styles.gmEntryHead}>
                  <span className={styles.gmEntryTitle}>{intern.role}</span>
                  <span className={styles.gmEntryDate}>{formatDate(intern.startDate)} — {formatDate(intern.endDate)}</span>
                </div>
                <div className={styles.gmEntryCompany}>{intern.company}</div>
                {intern.description && <p className={styles.gmEntryText}>{intern.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.some(e => e.institution) && (
          <div className={styles.gmMainSection}>
            <h2 className={styles.gmMainTitle}>Education</h2>
            {education.filter(e => e.institution).map(edu => (
              <div key={edu.id} className={styles.gmEntry}>
                <div className={styles.gmEntryHead}>
                  <span className={styles.gmEntryTitle}>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  <span className={styles.gmEntryDate}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                </div>
                <div className={styles.gmEntryCompany}>
                  {edu.institution} 
                  {edu.gpa && ` | GPA: ${edu.gpa}`} 
                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {academicProjects.some(p => p.name) && (
          <div className={styles.gmMainSection}>
            <h2 className={styles.gmMainTitle}>Projects</h2>
            {academicProjects.filter(p => p.name).map(proj => (
              <div key={proj.id} className={styles.gmEntry}>
                <span className={styles.gmEntryTitle}>{proj.name}</span>
                {proj.technologies && <div className={styles.gmEntryCompany}>{proj.technologies}</div>}
                {proj.description && <p className={styles.gmEntryText}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {customSections.map(section => (
          section.items.some(i => i.content) && (
            <div key={section.id} className={styles.gmMainSection}>
              <h2 className={styles.gmMainTitle}>{section.title}</h2>
              <ul style={{ paddingLeft: '16px' }}>
                {section.items.filter(i => i.content).map(item => (
                  <li key={item.id} style={{ fontSize: '8.5pt', marginBottom: '3px', color: '#444' }}>{item.content}</li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
