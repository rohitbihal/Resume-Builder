'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';
import Logo from '@/components/Branding/Logo';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading your creative space...</p>
      </div>
    );
  }

  return (
    <main className={styles.dashboard}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--cr-text-muted)' }}>{user?.email}</span>
            <button className="cr-btn cr-btn-sm" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <header className={styles.welcome}>
          <h1 className={styles.title}>Welcome Back, Creative.</h1>
          <p className={styles.subtitle}>Manage your resumes and career tracks from one place.</p>
        </header>

        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.cardIcon}>✍️</span>
            <h3 className={styles.cardTitle}>New Resume</h3>
            <p className={styles.cardDesc}>
              Start with a fresh template and choose your career track to get the most relevant suggestions.
            </p>
            <div className={styles.cardCta}>
              <Link href="/builder" className="cr-btn cr-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Create New Resume
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>🎨</span>
            <h3 className={styles.cardTitle}>Browse Templates</h3>
            <p className={styles.cardDesc}>
              Explore our collection of 5 premium creative templates designed to stand out in any industry.
            </p>
            <div className={styles.cardCta}>
              <Link href="/templates" className="cr-btn cr-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                View Templates
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.cardIcon}>💎</span>
            <h3 className={styles.cardTitle}>Upgrade to Pro</h3>
            <p className={styles.cardDesc}>
              Get unlimited downloads, remove watermarks, and access all future templates.
            </p>
            <div className={styles.cardCta}>
              <Link href="/pricing" className="cr-btn cr-btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
