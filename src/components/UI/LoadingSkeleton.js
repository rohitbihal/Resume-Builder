import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton({ variant = 'text', width, height, className = '' }) {
  const inlineStyle = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div 
      className={`${styles.skeleton} ${styles[variant]} ${className}`} 
      style={inlineStyle}
    />
  );
}
