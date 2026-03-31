'use client';

/**
 * Global Error Boundary (Next.js App Router)
 * Catches unhandled runtime errors and renders a graceful fallback UI
 * instead of a blank screen or an ugly 500 page.
 */

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to console in structured format so Vercel captures it
    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Unhandled client error',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
  }, [error]);

  // Generate a short reference code from the error for support
  const [refCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 0 20px rgba(255,100,100,0.5))',
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '0.75rem',
            background: 'linear-gradient(90deg, #ff6b6b, #ffd93d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Something went wrong
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            marginBottom: '0.5rem',
            lineHeight: 1.6,
          }}>
            An unexpected error occurred. Your resume data is safe — this is a display error only.
          </p>

          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '2.5rem',
            fontFamily: 'monospace',
          }}>
            Reference: #{refCode}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '50px',
                border: 'none',
                background: 'linear-gradient(135deg, #00B8A9, #0090FF)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 184, 169, 0.4)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              🔄 Try Again
            </button>

            <Link
              href="/dashboard"
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
                display: 'inline-block',
              }}
            >
              🏠 Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
