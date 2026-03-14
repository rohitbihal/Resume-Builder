import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { fontSize: '1.2rem', gap: '6px', iconSize: '24px' },
    md: { fontSize: '1.5rem', gap: '8px', iconSize: '32px' },
    lg: { fontSize: '2.2rem', gap: '12px', iconSize: '48px' },
  };

  const { fontSize, gap, iconSize } = sizes[size] || sizes.md;

  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: gap,
        fontWeight: '800',
        letterSpacing: '-0.02em',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <div 
        className="logo-icon"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: `calc(${iconSize} * 0.6)`,
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
          transform: 'rotate(-5deg)',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'}
      >
        R
      </div>
      <div 
        className="logo-text"
        style={{
          fontSize: fontSize,
          color: 'var(--cr-text)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span>Creative</span>
        <span style={{ 
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginLeft: '2px'
        }}>Resume</span>
      </div>
    </div>
  );
};

export default Logo;
