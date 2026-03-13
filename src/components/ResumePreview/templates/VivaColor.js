'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function VivaColor() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const levelToDots = (level) => {
    const map = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return map[level] || 2;
  };

  return (
    <div className={`${styles.resumePage} ${styles.vivaColor}`}>
      {/* Sidebar */}
      <div className={styles.vcSidebar}>
        <div className={styles.vcAvatar}>
          {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : '?'}
        </div>
        <div className={styles.vcSideName}>{personalInfo.fullName || 'Your Name'}</div>

        <div className={styles.vcSideSection}>
          <h3 className={styles.vcSideTitle}>Contact</h3>
          {personalInfo.email && <div className={styles.vcContactItem}>✉ {personalInfo.email}</div>}
          {personalInfo.phone && <div className={styles.vcContactItem}>📱 {personalInfo.phone}</div>}
          {personalInfo.location && <div className={styles.vcContactItem}>📍 {personalInfo.location}</div>}
          {personalInfo.linkedin && <div className={styles.vcContactItem}>🔗 {personalInfo.linkedin}</div>}
          {personalInfo.portfolio && <div className={styles.vcContactItem}>🌐 {personalInfo.portfolio}</div>}
        </div>

        {skills.some(s => s.name) && (
          <div className={styles.vcSideSection}>
            <h3 className={styles.vcSideTitle}>Skills</h3>
            {skills.filter(s => s.name).map(skill => (
              <div key={skill.id} className={styles.vcSkillDot}>
                <span className={styles.vcSkillLabel}>{skill.name}</span>
                <div className={styles.vcDotTrack}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`${styles.vcDot} ${i <= levelToDots(skill.level) ? styles.filled : ''}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {certifications.some(c => c.name) && (
          <div className={styles.vcSideSection}>
            <h3 className={styles.vcSideTitle}>Certifications</h3>
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} className={styles.vcContactItem}>
                🏆 {cert.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className={styles.vcMain}>
        <h1 className={styles.vcMainName}>{personalInfo.fullName || 'Your Name'}</h1>

        {track === 'experienced' && executiveSummary && (
          <div className={styles.vcMainSection}>
            <h2 className={styles.vcMainTitle}>Summary</h2>
            <p className={styles.vcEntryText}>{executiveSummary}</p>
          </div>
        )}

        {track === 'experienced' && workExperience.some(e => e.company) && (
          <div className={styles.vcMainSection}>
            <h2 className={styles.vcMainTitle}>Experience</h2>
            {workExperience.filter(e => e.company).map(exp => (
              <div key={exp.id} className={styles.vcEntry}>
                <div className={styles.vcEntryHead}>
                  <span className={styles.vcEntryTitle}>{exp.title}</span>
                  <span className={styles.vcEntryDate}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <div className={styles.vcEntryCompany}>{exp.company}</div>
                {exp.description && <p className={styles.vcEntryText}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {track === 'fresher' && internships.some(i => i.company) && (
          <div className={styles.vcMainSection}>
            <h2 className={styles.vcMainTitle}>Internships</h2>
            {internships.filter(i => i.company).map(intern => (
              <div key={intern.id} className={styles.vcEntry}>
                <div className={styles.vcEntryHead}>
                  <span className={styles.vcEntryTitle}>{intern.role}</span>
                  <span className={styles.vcEntryDate}>{formatDate(intern.startDate)} — {formatDate(intern.endDate)}</span>
                </div>
                <div className={styles.vcEntryCompany}>{intern.company}</div>
                {intern.description && <p className={styles.vcEntryText}>{intern.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.some(e => e.institution) && (
          <div className={styles.vcMainSection}>
            <h2 className={styles.vcMainTitle}>Education</h2>
            {education.filter(e => e.institution).map(edu => (
              <div key={edu.id} className={styles.vcEntry}>
                <div className={styles.vcEntryHead}>
                  <span className={styles.vcEntryTitle}>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  <span className={styles.vcEntryDate}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                </div>
                <div className={styles.vcEntryCompany}>
                  {edu.institution} 
                  {edu.gpa && ` | GPA: ${edu.gpa}`} 
                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {academicProjects.some(p => p.name) && (
          <div className={styles.vcMainSection}>
            <h2 className={styles.vcMainTitle}>Projects</h2>
            {academicProjects.filter(p => p.name).map(proj => (
              <div key={proj.id} className={styles.vcEntry}>
                <span className={styles.vcEntryTitle}>{proj.name}</span>
                {proj.technologies && <div className={styles.vcEntryCompany}>{proj.technologies}</div>}
                {proj.description && <p className={styles.vcEntryText}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        {customSections.map(section => (
          section.items.some(i => i.content) && (
            <div key={section.id} className={styles.vcMainSection}>
              <h2 className={styles.vcMainTitle}>{section.title}</h2>
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
