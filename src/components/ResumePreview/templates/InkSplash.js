'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function InkSplash() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className={`${styles.resumePage} ${styles.inkSplash}`}>
      <div className={styles.isContent}>
        <header className={styles.isHeader}>
          <h1 className={styles.isName}>{personalInfo.fullName || 'Your Name'}</h1>
          <div className={styles.isNameUnderline} />
          <div className={styles.isContact}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>• {personalInfo.portfolio}</span>}
          </div>
        </header>

        {track === 'experienced' && executiveSummary && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>About Me</h2>
            <p className={styles.isEntryText}>{executiveSummary}</p>
          </div>
        )}

        {track === 'experienced' && workExperience.some(e => e.company) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Experience</h2>
            {workExperience.filter(e => e.company).map(exp => (
              <div key={exp.id} className={styles.isEntry}>
                <div className={styles.isEntryHead}>
                  <span className={styles.isEntryTitle}>{exp.title}</span>
                  <span className={styles.isEntryDate}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <div className={styles.isEntryMeta}>{exp.company}</div>
                {exp.description && <p className={styles.isEntryText}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {track === 'fresher' && internships.some(i => i.company) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Internships</h2>
            {internships.filter(i => i.company).map(intern => (
              <div key={intern.id} className={styles.isEntry}>
                <div className={styles.isEntryHead}>
                  <span className={styles.isEntryTitle}>{intern.role}</span>
                  <span className={styles.isEntryDate}>{formatDate(intern.startDate)} — {formatDate(intern.endDate)}</span>
                </div>
                <div className={styles.isEntryMeta}>{intern.company}</div>
                {intern.description && <p className={styles.isEntryText}>{intern.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.some(e => e.institution) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Education</h2>
            {education.filter(e => e.institution).map(edu => (
              <div key={edu.id} className={styles.isEntry}>
                <div className={styles.isEntryHead}>
                  <span className={styles.isEntryTitle}>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  <span className={styles.isEntryDate}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                </div>
                <div className={styles.isEntryMeta}>
                  {edu.institution} 
                  {edu.gpa && ` | GPA: ${edu.gpa}`} 
                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {academicProjects.some(p => p.name) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Projects</h2>
            {academicProjects.filter(p => p.name).map(proj => (
              <div key={proj.id} className={styles.isEntry}>
                <span className={styles.isEntryTitle}>{proj.name}</span>
                {proj.technologies && <div className={styles.isEntryMeta}>{proj.technologies}</div>}
                {proj.description && <p className={styles.isEntryText}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {skills.some(s => s.name) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Skills</h2>
            <div className={styles.isSkills}>
              {skills.filter(s => s.name).map(skill => (
                <div key={skill.id} className={styles.isSkillItem}>
                  <span style={{ minWidth: '70px', fontSize: '8.5pt' }}>{skill.name}</span>
                  <div className={styles.isSkillBarTrack}>
                    <div className={styles.isSkillBarFill} style={{ width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '80%' : skill.level === 'intermediate' ? '60%' : '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.some(c => c.name) && (
          <div className={styles.isSection}>
            <h2 className={styles.isSectionTitle}>Certifications</h2>
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} className={styles.isEntry}>
                <strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
              </div>
            ))}
          </div>
        )}

        {customSections.map(section => (
          section.items.some(i => i.content) && (
            <div key={section.id} className={styles.isSection}>
              <h2 className={styles.isSectionTitle}>{section.title}</h2>
              <ul className={styles.isBullets}>
                {section.items.filter(i => i.content).map(item => (
                  <li key={item.id}>{item.content}</li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
