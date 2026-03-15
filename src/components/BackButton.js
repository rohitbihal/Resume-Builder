'use client';

import { useRouter } from 'next/navigation';
import styles from './BackButton.module.css';

export default function BackButton({ href, label = 'Back' }) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button onClick={handleBack} className={styles.backButton} aria-label="Go back">
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}
