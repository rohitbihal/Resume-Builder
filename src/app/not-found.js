import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | CreativeResume',
  description: 'The page you are looking for does not exist.',
};

/**
 * Custom 404 Not Found page (Next.js App Router).
 * Renders a premium experience instead of the default Next.js 404.
 */
export default function NotFound() {
  return (
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
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Animated 404 Text */}
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 10rem)',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #00B8A9 0%, #0090FF 50%, #A855F7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '1rem',
        letterSpacing: '-0.05em',
      }}>
        404
      </div>

      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>

      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
        fontWeight: 700,
        marginBottom: '0.75rem',
        margin: '0 0 0.75rem 0',
      }}>
        This page doesn&apos;t exist
      </h1>

      <p style={{
        fontSize: '1.1rem',
        color: 'rgba(255,255,255,0.65)',
        maxWidth: '480px',
        lineHeight: 1.6,
        marginBottom: '2.5rem',
      }}>
        The page you&apos;re looking for may have been moved, renamed, or doesn&apos;t exist.
        Let&apos;s get you back on track.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(135deg, #00B8A9, #0090FF)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0, 184, 169, 0.4)',
          }}
        >
          🏠 Go Home
        </Link>

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
          📋 My Resumes
        </Link>

        <Link
          href="/builder"
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          ✨ Build Resume
        </Link>
      </div>
    </div>
  );
}
