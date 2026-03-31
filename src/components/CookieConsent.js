'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cr_cookie_consent');
    if (!consent) {
      Promise.resolve().then(() => setIsVisible(true));
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cr_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cr_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      right: '1rem',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div className="cr-card cr-glass" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        maxWidth: '800px', 
        width: '100%', 
        padding: '1.5rem',
        border: '1px solid var(--cr-border)',
        boxShadow: 'var(--cr-shadow-lg)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>We Value Your Privacy</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--cr-text-muted)', lineHeight: '1.5' }}>
            We use cookies to enhance your browsing experience, analyze site traffic, and manage secure sessions (including Stripe/Razorpay payments). By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our <Link href="/privacy" style={{ textDecoration: 'underline', color: 'var(--cr-primary)' }}>Privacy Policy</Link> for more information.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end' }}>
          <button 
            onClick={handleDecline} 
            className="cr-btn cr-btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            Decline
          </button>
          <button 
            onClick={handleAccept} 
            className="cr-btn cr-btn-primary" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 1.5rem' }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
