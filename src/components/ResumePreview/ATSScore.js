'use client';

import { useResume } from '@/context/ResumeContext';
import { useMemo } from 'react';
import styles from './ATSScore.module.css';

export default function ATSScore() {
  const resumeState = useResume();

  const scoreInfo = useMemo(() => {
    let score = 0;
    const tips = [];

    // Personal Info (20 pts max)
    const { personalInfo } = resumeState;
    if (personalInfo) {
      if (personalInfo.fullName) score += 5;
      else tips.push("Add your full name");
      
      if (personalInfo.email) score += 5;
      else tips.push("Add an email address");
      
      if (personalInfo.phone) score += 5;
      else tips.push("Add a phone number");
      
      if (personalInfo.linkedin || personalInfo.website) score += 5;
      else tips.push("Add a LinkedIn profile or website");
    }

    // Summary (15 pts)
    const summary = resumeState.executiveSummary;
    if (summary && summary.length > 80) score += 15;
    else if (summary && summary.length > 0) {
      score += 5;
      tips.push("Make your summary slightly longer (80+ chars)");
    } else tips.push("Add an executive summary");

    // Experience (25 pts)
    const experience = resumeState.workExperience || [];
    if (experience.length > 0) {
      const bestExp = experience.reduce((max, exp) => Math.max(max, exp.description?.length || 0), 0);
      if (bestExp > 150) {
        score += 25;
      } else if (bestExp > 50) {
        score += 15;
        tips.push("Add more detail to your work experience bullets");
      } else {
        score += 5;
        tips.push("Describe your work experience achievements");
      }
    } else {
      tips.push("Add work experience");
    }

    // Education (20 pts)
    const education = resumeState.education || [];
    if (education.length > 0) {
      const bestEdu = education[0];
      if (bestEdu.school && bestEdu.degree) score += 20;
      else {
        score += 10;
        tips.push("Complete your education details (school & degree)");
      }
    } else {
      tips.push("Add your education background");
    }

    // Skills (20 pts)
    const skills = resumeState.skills || [];
    if (skills.length >= 5) score += 20;
    else if (skills.length > 0) {
      score += 10;
      tips.push(`Add at least ${5 - skills.length} more skills`);
    } else {
      tips.push("Add at least 5 key skills");
    }

    return { score, tips: tips.slice(0, 2) }; // Only show top 2 tips
  }, [resumeState]);

  const { score, tips } = scoreInfo;
  
  let colorClass = styles.low;
  if (score >= 80) colorClass = styles.high;
  else if (score >= 50) colorClass = styles.medium;

  return (
    <div className={styles.scoreContainer}>
      <div className={styles.scoreHeader}>
        <span className={styles.scoreLabel}>ATS Score</span>
        <div className={`${styles.scoreBadge} ${colorClass}`}>
          {score}/100
        </div>
      </div>
      
      {tips.length > 0 && (
        <div className={styles.tipsContainer}>
          {tips.map((tip, i) => (
            <div key={i} className={styles.tip}>• {tip}</div>
          ))}
        </div>
      )}
    </div>
  );
}
