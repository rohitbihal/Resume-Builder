'use client';

import { useResume } from '@/context/ResumeContext';
import styles from '../templates.module.css';

export default function VivaColor() {
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

  const levelToStars = (level) => {
    return level === 'expert' ? 5 : level === 'advanced' ? 4 : level === 'intermediate' ? 3 : 2;
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

        {resume.is_public && resume.id && typeof window !== 'undefined' && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/share/' + resume.id)}`} 
              alt="Resume QR Code"
              style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            <p style={{ fontSize: '6pt', opacity: 0.6, marginTop: '4px' }}>Scan to view profile</p>
          </div>
        )}

        {skills.some(s => s.name) && (
          <div className={styles.vcSideSection}>
            <h3 className={styles.vcSideTitle}>Skills</h3>
            {skills.filter(s => s.name).map(skill => (
              <div key={skill.id} className={styles.vcSkillDot} style={{ justifyContent: 'space-between' }}>
                <span className={styles.vcSkillLabel}>{skill.name}</span>
                <div style={{ display: 'flex', gap: '2px', color: '#fff' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{ opacity: i <= levelToStars(skill.level) ? 1 : 0.3, fontSize: '8pt' }}>★</span>
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

        {layoutOrder.map(sectionId => {
          switch (sectionId) {
            case 'executiveSummary':
              return executiveSummary && (
                <div key="execSum" className={styles.vcMainSection}>
                  <h2 className={styles.vcMainTitle}>Summary</h2>
                  <p className={styles.vcEntryText}>{executiveSummary}</p>
                </div>
              );
            case 'workExperience':
              return workExperience.some(e => e.company) && (
                <div key="workExp" className={styles.vcMainSection}>
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
              );
            case 'internships':
              return internships.some(i => i.company) && (
                <div key="interns" className={styles.vcMainSection}>
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
              );
            case 'education':
              return education.some(e => e.institution) && (
                <div key="edu" className={styles.vcMainSection}>
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
              );
            case 'academicProjects':
              return academicProjects.some(p => p.name) && (
                <div key="acadProj" className={styles.vcMainSection}>
                  <h2 className={styles.vcMainTitle}>Projects</h2>
                  {academicProjects.filter(p => p.name).map(proj => (
                    <div key={proj.id} className={styles.vcEntry}>
                      <span className={styles.vcEntryTitle}>{proj.name}</span>
                      {proj.technologies && <div className={styles.vcEntryCompany}>{proj.technologies}</div>}
                      {proj.description && <p className={styles.vcEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'clientProjects':
              return resume.clientProjects?.some(p => p.client) && (
                <div key="clientProj" className={styles.vcMainSection}>
                  <h2 className={styles.vcMainTitle}>Clients</h2>
                  {resume.clientProjects.filter(p => p.client).map(proj => (
                    <div key={proj.id} className={styles.vcEntry}>
                      <div className={styles.vcEntryHead}>
                        <span className={styles.vcEntryTitle}>{proj.client}</span>
                        <span className={styles.vcEntryDate}>{proj.role}</span>
                      </div>
                      {proj.duration && <div className={styles.vcEntryCompany}>{proj.duration}</div>}
                      {proj.description && <p className={styles.vcEntryText}>{proj.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'researchPapers':
              return resume.researchPapers?.some(p => p.title) && (
                <div key="research" className={styles.vcMainSection}>
                  <h2 className={styles.vcMainTitle}>Publications</h2>
                  {resume.researchPapers.filter(p => p.title).map(paper => (
                    <div key={paper.id} className={styles.vcEntry}>
                      <div className={styles.vcEntryHead}>
                        <span className={styles.vcEntryTitle}>{paper.title}</span>
                        <span className={styles.vcEntryDate}>{paper.date}</span>
                      </div>
                      <div className={styles.vcEntryCompany}>{paper.publication}</div>
                      {paper.abstract && <p className={styles.vcEntryText}>{paper.abstract}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'portfolio':
              return resume.portfolio?.some(p => p.title) && (
                <div key="portfolio" className={styles.vcMainSection}>
                  <h2 className={styles.vcMainTitle}>Portfolio</h2>
                  {resume.portfolio.filter(p => p.title).map(item => (
                    <div key={item.id} className={styles.vcEntry}>
                      <span className={styles.vcEntryTitle}>{item.title}</span>
                      {item.description && <p className={styles.vcEntryText}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              );
            case 'customSections':
              return customSections.map(section => (
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
              ));
            default:
              return null; // skills, certifications, personalInfo are rendered elsewhere in this template
          }
        })}
      </div>
    </div>
  );
}
