'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

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
      <p style={{ color: '#a0aec0', marginBottom: '1rem', maxWidth: '500px' }}>
        We encountered an error while trying to sign you in.
      </p>
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #ef4444', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          color: '#f87171',
          fontSize: '0.9rem',
          maxWidth: '600px',
          wordBreak: 'break-all'
        }}>
          <strong>Details:</strong> {error}
        </div>
      )}
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

export default function AuthCodeError() {
  return (
    <Suspense fallback={<div style={{ color: '#fff' }}>Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
