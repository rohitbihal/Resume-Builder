'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';
import Image from 'next/image';

export default function InkSplash() {
  const resume = useResume();
  const { personalInfo, education, skills, workExperience, internships, academicProjects, executiveSummary, certifications, customSections, track, layoutOrder } = resume;

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const renderStars = (level) => {
    const stars = level === 'expert' ? 5 : level === 'advanced' ? 4 : level === 'intermediate' ? 3 : 2;
    return (
      <div style={{ color: '#5BBFB5', fontSize: '10pt', display: 'flex' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>★</span>
        ))}
      </div>
    );
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

        {resume.is_public && resume.id && typeof window !== 'undefined' && (
          <div style={{ position: 'absolute', top: '35px', right: '35px', textAlign: 'center' }}>
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/share/' + resume.id)}`} 
              alt="Resume QR Code"
              width={60}
              height={60}
              style={{ opacity: 0.8 }}
              unoptimized
            />
          </div>
        )}

        {layoutOrder.map(sectionId => {
          switch (sectionId) {
            case 'executiveSummary':
              return executiveSummary && (
                <div key="execSum" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>About Me</h2>
                  <p className={styles.isEntryText}>{executiveSummary}</p>
                </div>
              );
            case 'workExperience':
              return workExperience.some(e => e.company) && (
                <div key="workExp" className={styles.isSection}>
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
              );
            case 'internships':
              return internships.some(i => i.company) && (
                <div key="interns" className={styles.isSection}>
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
              );
            case 'education':
              return education.some(e => e.institution) && (
                <div key="edu" className={styles.isSection}>
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
              );
            case 'academicProjects':
              return academicProjects.some(p => p.name) && (
                <div key="acadProj" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Projects</h2>
                  {academicProjects.filter(p => p.name).map(proj => (
                    <div key={proj.id} className={styles.isEntry}>
                      <span className={styles.isEntryTitle}>{proj.name}</span>
                      {proj.technologies && <div className={styles.isEntryMeta}>{proj.technologies}</div>}
                      {proj.description && <p className={styles.isEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'clientProjects':
              return resume.clientProjects?.some(p => p.client) && (
                <div key="clientProj" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Clients</h2>
                  {resume.clientProjects.filter(p => p.client).map(proj => (
                    <div key={proj.id} className={styles.isEntry}>
                      <div className={styles.isEntryHead}>
                        <span className={styles.isEntryTitle}>{proj.client}</span>
                        <span className={styles.isEntryDate}>{proj.role}</span>
                      </div>
                      {proj.duration && <div className={styles.isEntryMeta}>{proj.duration}</div>}
                      {proj.description && <p className={styles.isEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'researchPapers':
              return resume.researchPapers?.some(p => p.title) && (
                <div key="research" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Publications</h2>
                  {resume.researchPapers.filter(p => p.title).map(paper => (
                    <div key={paper.id} className={styles.isEntry}>
                      <div className={styles.isEntryHead}>
                        <span className={styles.isEntryTitle}>{paper.title}</span>
                        <span className={styles.isEntryDate}>{paper.date}</span>
                      </div>
                      <div className={styles.isEntryMeta}>{paper.publication}</div>
                      {paper.abstract && <p className={styles.isEntryText}>{paper.abstract}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'portfolio':
              return resume.portfolio?.some(p => p.title) && (
                <div key="portfolio" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Portfolio</h2>
                  {resume.portfolio.filter(p => p.title).map(item => (
                    <div key={item.id} className={styles.isEntry}>
                      <span className={styles.isEntryTitle}>{item.title}</span>
                      {item.description && <p className={styles.isEntryText}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'skills':
              return skills.some(s => s.name) && (
                <div key="skills" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Skills</h2>
                  <div className={styles.isSkills} style={{ gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                    {skills.filter(s => s.name).map(skill => (
                      <div key={skill.id} className={styles.isSkillItem} style={{ justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '8.5pt', fontWeight: 600 }}>{skill.name}</span>
                        {renderStars(skill.level)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'certifications':
              return certifications.some(c => c.name) && (
                <div key="certs" className={styles.isSection}>
                  <h2 className={styles.isSectionTitle}>Certifications</h2>
                  {certifications.filter(c => c.name).map(cert => (
                    <div key={cert.id} className={styles.isEntry}>
                      <strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                    </div>
                  ))}
                </div>
              );
            case 'customSections':
              return customSections.map(section => (
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
              ));
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
