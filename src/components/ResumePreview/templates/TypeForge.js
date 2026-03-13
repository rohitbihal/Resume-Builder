'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function TypeForge() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className={`${styles.resumePage} ${styles.typeForge}`}>
      <div className={styles.tfContent}>
        <div className={styles.tfHero}>
          <h1 className={styles.tfName}>{personalInfo.fullName || 'Your Name'}</h1>
        </div>

        <div className={styles.tfContact}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>

        {track === 'experienced' && executiveSummary && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>SUMMARY</h2>
            <div className={styles.tfSectionBg}>
              <p className={styles.tfEntryText}>{executiveSummary}</p>
            </div>
          </div>
        )}

        {track === 'experienced' && workExperience.some(e => e.company) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>EXPERIENCE</h2>
            {workExperience.filter(e => e.company).map(exp => (
              <div key={exp.id} className={styles.tfEntry}>
                <div className={styles.tfEntryHead}>
                  <span className={styles.tfEntryTitle}>{exp.title}</span>
                  <span className={styles.tfEntryDate}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <div className={styles.tfEntryMeta}>{exp.company}</div>
                {exp.description && <p className={styles.tfEntryText}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {track === 'fresher' && internships.some(i => i.company) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>INTERNSHIPS</h2>
            {internships.filter(i => i.company).map(intern => (
              <div key={intern.id} className={styles.tfEntry}>
                <div className={styles.tfEntryHead}>
                  <span className={styles.tfEntryTitle}>{intern.role}</span>
                  <span className={styles.tfEntryDate}>{formatDate(intern.startDate)} — {formatDate(intern.endDate)}</span>
                </div>
                <div className={styles.tfEntryMeta}>{intern.company}</div>
                {intern.description && <p className={styles.tfEntryText}>{intern.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.some(e => e.institution) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>EDUCATION</h2>
            {education.filter(e => e.institution).map(edu => (
              <div key={edu.id} className={styles.tfEntry}>
                <div className={styles.tfEntryHead}>
                  <span className={styles.tfEntryTitle}>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  <span className={styles.tfEntryDate}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                </div>
                <div className={styles.tfEntryMeta}>
                  {edu.institution} 
                  {edu.gpa && ` | GPA: ${edu.gpa}`} 
                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {academicProjects.some(p => p.name) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>PROJECTS</h2>
            {academicProjects.filter(p => p.name).map(proj => (
              <div key={proj.id} className={styles.tfEntry}>
                <span className={styles.tfEntryTitle}>{proj.name}</span>
                {proj.technologies && <div className={styles.tfEntryMeta}>{proj.technologies}</div>}
                {proj.description && <p className={styles.tfEntryText}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {skills.some(s => s.name) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>SKILLS</h2>
            <div className={styles.tfSectionBg}>
              <span className={styles.tfSkillLine}>
                {skills.filter(s => s.name).map(s => s.name).join(', ')}
              </span>
            </div>
          </div>
        )}

        {certifications.some(c => c.name) && (
          <div className={styles.tfSection}>
            <h2 className={styles.tfSectionTitle}>CERTIFICATIONS</h2>
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} className={styles.tfEntry}>
                <strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
              </div>
            ))}
          </div>
        )}

        {customSections.map(section => (
          section.items.some(i => i.content) && (
            <div key={section.id} className={styles.tfSection}>
              <h2 className={styles.tfSectionTitle}>{section.title.toUpperCase()}</h2>
              <div className={styles.tfSectionBg}>
                <ul style={{ paddingLeft: '16px' }}>
                  {section.items.filter(i => i.content).map(item => (
                    <li key={item.id} style={{ fontSize: '8.5pt', marginBottom: '3px' }}>{item.content}</li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
