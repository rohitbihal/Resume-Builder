'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function BoldNeo() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className={`${styles.resumePage} ${styles.boldNeo}`}>
      <div className={styles.bnAccentBar} />

      <div className={styles.bnContent}>
        <header className={styles.bnHeader}>
          <h1 className={styles.bnName}>{personalInfo.fullName || 'Your Name'}</h1>
          <div className={styles.bnContact}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
            {personalInfo.portfolio && <span>• {personalInfo.portfolio}</span>}
          </div>
        </header>

        {track === 'experienced' && executiveSummary && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>SUMMARY</h2>
            <p className={styles.bnText}>{executiveSummary}</p>
          </section>
        )}

        {track === 'experienced' && workExperience.some(e => e.company) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>EXPERIENCE</h2>
            {workExperience.filter(e => e.company).map(exp => (
              <div key={exp.id} className={styles.bnEntry}>
                <div className={styles.bnEntryHeader}>
                  <strong>{exp.title}</strong>
                  <span className={styles.bnDate}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                </div>
                <div className={styles.bnCompany}>{exp.company}</div>
                {exp.description && <p className={styles.bnText}>{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {track === 'fresher' && internships.some(i => i.company) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>INTERNSHIPS</h2>
            {internships.filter(i => i.company).map(intern => (
              <div key={intern.id} className={styles.bnEntry}>
                <div className={styles.bnEntryHeader}>
                  <strong>{intern.role}</strong>
                  <span className={styles.bnDate}>{formatDate(intern.startDate)} — {formatDate(intern.endDate)}</span>
                </div>
                <div className={styles.bnCompany}>{intern.company}</div>
                {intern.description && <p className={styles.bnText}>{intern.description}</p>}
              </div>
            ))}
          </section>
        )}

        {education.some(e => e.institution) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>EDUCATION</h2>
            {education.filter(e => e.institution).map(edu => (
              <div key={edu.id} className={styles.bnEntry}>
                <div className={styles.bnEntryHeader}>
                  <strong>{edu.degree} {edu.field && `in ${edu.field}`}</strong>
                  <span className={styles.bnDate}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
                </div>
                <div className={styles.bnCompany}>
                  {edu.institution} 
                  {edu.gpa && ` | GPA: ${edu.gpa}`} 
                  {edu.cgpa && ` | CGPA: ${edu.cgpa}`}
                </div>
              </div>
            ))}
          </section>
        )}

        {academicProjects.some(p => p.name) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>PROJECTS</h2>
            {academicProjects.filter(p => p.name).map(proj => (
              <div key={proj.id} className={styles.bnEntry}>
                <div className={styles.bnEntryHeader}>
                  <strong>{proj.name}</strong>
                  {proj.technologies && <span className={styles.bnTech}>{proj.technologies}</span>}
                </div>
                {proj.description && <p className={styles.bnText}>{proj.description}</p>}
              </div>
            ))}
          </section>
        )}

        {skills.some(s => s.name) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>SKILLS</h2>
            <div className={styles.bnSkills}>
              {skills.filter(s => s.name).map(skill => (
                <div key={skill.id} className={styles.bnSkillBar}>
                  <span className={styles.bnSkillName}>{skill.name}</span>
                  <div className={styles.bnSkillTrack}>
                    <div className={styles.bnSkillFill} style={{ width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '80%' : skill.level === 'intermediate' ? '60%' : '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.some(c => c.name) && (
          <section className={styles.bnSection}>
            <h2 className={styles.bnSectionTitle}>CERTIFICATIONS</h2>
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} className={styles.bnEntry}>
                <strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
              </div>
            ))}
          </section>
        )}

        {customSections.map(section => (
          section.items.some(i => i.content) && (
            <section key={section.id} className={styles.bnSection}>
              <h2 className={styles.bnSectionTitle}>{section.title.toUpperCase()}</h2>
              <ul className={styles.bnBullets}>
                {section.items.filter(i => i.content).map(item => (
                  <li key={item.id}>{item.content}</li>
                ))}
              </ul>
            </section>
          )
        ))}
      </div>
    </div>
  );
}
