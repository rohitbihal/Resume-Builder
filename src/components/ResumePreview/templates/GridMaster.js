'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';
import Image from 'next/image';

export default function GridMaster() {
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
      <div style={{ color: '#7C6BB5', fontSize: '8pt', display: 'flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>★</span>
        ))}
      </div>
    );
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
            <div className={styles.gmSkillTags} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {skills.filter(s => s.name).map(skill => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.gmTag} style={{ background: 'transparent', padding: 0, color: '#2D1B69' }}>{skill.name}</span>
                  {renderStars(skill.level)}
                </div>
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

        {resume.is_public && resume.id && typeof window !== 'undefined' && (
          <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '1rem' }}>
            <Image 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/share/' + resume.id)}`} 
              alt="Resume QR Code"
              width={60}
              height={60}
              style={{ border: '1px solid #ddd', padding: '2px', background: '#fff' }}
              unoptimized
            />
            <p style={{ fontSize: '6pt', color: '#666', marginTop: '4px', margin: 0 }}>Scan to view online</p>
          </div>
        )}
      </div>

      {/* Main */}
      <div className={styles.gmMain}>
        <h1 className={styles.gmName}>{personalInfo.fullName || 'Your Name'}</h1>
        <p className={styles.gmSubtitle}>{personalInfo.email}</p>

        {layoutOrder.map(sectionId => {
          switch (sectionId) {
            case 'executiveSummary':
              return executiveSummary && (
                <div key="execSum" className={styles.gmMainSection}>
                  <h2 className={styles.gmMainTitle}>Professional Summary</h2>
                  <p className={styles.gmEntryText}>{executiveSummary}</p>
                </div>
              );
            case 'workExperience':
              return workExperience.some(e => e.company) && (
                <div key="workExp" className={styles.gmMainSection}>
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
              );
            case 'internships':
              return internships.some(i => i.company) && (
                <div key="interns" className={styles.gmMainSection}>
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
              );
            case 'education':
              return education.some(e => e.institution) && (
                <div key="edu" className={styles.gmMainSection}>
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
              );
            case 'academicProjects':
              return academicProjects.some(p => p.name) && (
                <div key="acadProj" className={styles.gmMainSection}>
                  <h2 className={styles.gmMainTitle}>Projects</h2>
                  {academicProjects.filter(p => p.name).map(proj => (
                    <div key={proj.id} className={styles.gmEntry}>
                      <span className={styles.gmEntryTitle}>{proj.name}</span>
                      {proj.technologies && <div className={styles.gmEntryCompany}>{proj.technologies}</div>}
                      {proj.description && <p className={styles.gmEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'clientProjects':
              return resume.clientProjects?.some(p => p.client) && (
                <div key="clientProj" className={styles.gmMainSection}>
                  <h2 className={styles.gmMainTitle}>Clients</h2>
                  {resume.clientProjects.filter(p => p.client).map(proj => (
                    <div key={proj.id} className={styles.gmEntry}>
                      <div className={styles.gmEntryHead}>
                        <span className={styles.gmEntryTitle}>{proj.client}</span>
                        <span className={styles.gmEntryDate}>{proj.role}</span>
                      </div>
                      {proj.duration && <div className={styles.gmEntryCompany}>{proj.duration}</div>}
                      {proj.description && <p className={styles.gmEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'researchPapers':
              return resume.researchPapers?.some(p => p.title) && (
                <div key="research" className={styles.gmMainSection}>
                  <h2 className={styles.gmMainTitle}>Publications</h2>
                  {resume.researchPapers.filter(p => p.title).map(paper => (
                    <div key={paper.id} className={styles.gmEntry}>
                      <div className={styles.gmEntryHead}>
                        <span className={styles.gmEntryTitle}>{paper.title}</span>
                        <span className={styles.gmEntryDate}>{paper.date}</span>
                      </div>
                      <div className={styles.gmEntryCompany}>{paper.publication}</div>
                      {paper.abstract && <p className={styles.gmEntryText}>{paper.abstract}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'portfolio':
              return resume.portfolio?.some(p => p.title) && (
                <div key="portfolio" className={styles.gmMainSection}>
                  <h2 className={styles.gmMainTitle}>Portfolio</h2>
                  {resume.portfolio.filter(p => p.title).map(item => (
                    <div key={item.id} className={styles.gmEntry}>
                      <span className={styles.gmEntryTitle}>{item.title}</span>
                      {item.description && <p className={styles.gmEntryText}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'customSections':
              return customSections.map(section => (
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
              ));
            default:
              return null; // skills, certifications, personalInfo are rendered elsewhere in this template
          }
        })}
      </div>
    </div>
  );
}
