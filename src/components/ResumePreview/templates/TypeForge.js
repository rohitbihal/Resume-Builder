'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';
import Image from 'next/image';

export default function TypeForge() {
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
      <div style={{ color: '#1a1a1a', fontSize: '8pt', display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className={`${styles.resumePage} ${styles.typeForge}`}>
      <div className={styles.tfContent}>
        <div className={styles.tfHero}>
          <h1 className={styles.tfName}>{personalInfo.fullName || 'Your Name'}</h1>
        </div>

        {resume.is_public && resume.id && typeof window !== 'undefined' && (
          <div style={{ position: 'absolute', top: '30px', right: '30px', textAlign: 'center' }}>
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/share/' + resume.id)}`} 
              alt="Resume QR Code"
              width={50}
              height={50}
              style={{ filter: 'grayscale(1)', opacity: 0.6 }}
              unoptimized
            />
          </div>
        )}

        <div className={styles.tfContact}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>

        {layoutOrder.map(sectionId => {
          switch (sectionId) {
            case 'executiveSummary':
              return executiveSummary && (
                <div key="execSum" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>SUMMARY</h2>
                  <div className={styles.tfSectionBg}>
                    <p className={styles.tfEntryText}>{executiveSummary}</p>
                  </div>
                </div>
              );
            case 'workExperience':
              return workExperience.some(e => e.company) && (
                <div key="workExp" className={styles.tfSection}>
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
              );
            case 'internships':
              return internships.some(i => i.company) && (
                <div key="interns" className={styles.tfSection}>
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
              );
            case 'education':
              return education.some(e => e.institution) && (
                <div key="edu" className={styles.tfSection}>
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
              );
            case 'academicProjects':
              return academicProjects.some(p => p.name) && (
                <div key="acadProj" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>PROJECTS</h2>
                  {academicProjects.filter(p => p.name).map(proj => (
                    <div key={proj.id} className={styles.tfEntry}>
                      <span className={styles.tfEntryTitle}>{proj.name}</span>
                      {proj.technologies && <div className={styles.tfEntryMeta}>{proj.technologies}</div>}
                      {proj.description && <p className={styles.tfEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'clientProjects':
              return resume.clientProjects?.some(p => p.client) && (
                <div key="clientProj" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>CLIENTS</h2>
                  {resume.clientProjects.filter(p => p.client).map(proj => (
                    <div key={proj.id} className={styles.tfEntry}>
                      <div className={styles.tfEntryHead}>
                        <span className={styles.tfEntryTitle}>{proj.client}</span>
                        <span className={styles.tfEntryDate}>{proj.role}</span>
                      </div>
                      {proj.duration && <div className={styles.tfEntryMeta}>{proj.duration}</div>}
                      {proj.description && <p className={styles.tfEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'researchPapers':
              return resume.researchPapers?.some(p => p.title) && (
                <div key="research" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>PUBLICATIONS</h2>
                  {resume.researchPapers.filter(p => p.title).map(paper => (
                    <div key={paper.id} className={styles.tfEntry}>
                      <div className={styles.tfEntryHead}>
                        <span className={styles.tfEntryTitle}>{paper.title}</span>
                        <span className={styles.tfEntryDate}>{paper.date}</span>
                      </div>
                      <div className={styles.tfEntryMeta}>{paper.publication}</div>
                      {paper.abstract && <p className={styles.tfEntryText}>{paper.abstract}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'portfolio':
              return resume.portfolio?.some(p => p.title) && (
                <div key="portfolio" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>PORTFOLIO</h2>
                  {resume.portfolio.filter(p => p.title).map(item => (
                    <div key={item.id} className={styles.tfEntry}>
                      <span className={styles.tfEntryTitle}>{item.title}</span>
                      {item.description && <p className={styles.tfEntryText}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'skills':
              return skills.some(s => s.name) && (
                <div key="skills" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>SKILLS</h2>
                  <div className={styles.tfSectionBg} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 30px' }}>
                    {skills.filter(s => s.name).map(skill => (
                      <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={styles.tfSkillLine} style={{ fontWeight: 600 }}>{skill.name}</span>
                        {renderStars(skill.level)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            case 'certifications':
              return certifications.some(c => c.name) && (
                <div key="certs" className={styles.tfSection}>
                  <h2 className={styles.tfSectionTitle}>CERTIFICATIONS</h2>
                  {certifications.filter(c => c.name).map(cert => (
                    <div key={cert.id} className={styles.tfEntry}>
                      <strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${formatDate(cert.date)})`}
                    </div>
                  ))}
                </div>
              );
            case 'customSections':
              return customSections.map(section => (
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
              ));
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
