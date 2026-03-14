'use client';

import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'var(--cr-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        OAuth Error
      </h1>
      <p style={{ color: '#a0aec0', marginBottom: '2rem', maxWidth: '500px' }}>
        We encountered an error while trying to sign you in. This can happen if the authentication code expired or if there was a network timeout.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/auth" className="cr-btn cr-btn-primary">
          Try Again
        </Link>
        <Link href="/" className="cr-btn cr-btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
