'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Logo from './Branding/Logo';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <Logo size="sm" />
        </Link>
        
        <div className={styles.navLinks}>
          <Link href="/builder" className={styles.navLink}>Builder</Link>
          <Link href="/templates" className={styles.navLink}>Templates</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          
          {user && (
            <Link href="/dashboard" className={styles.navLink}>My Resumes</Link>
          )}
        </div>

        <div className={styles.authActions}>
          {loading ? (
             <div className={styles.loading}>...</div>
          ) : user ? (
            <div className={styles.userSection}>
              <span className={styles.userEmail}>{user.email}</span>
              <button onClick={handleSignOut} className="cr-btn cr-btn-secondary cr-btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className={styles.guestSection}>
              <Link href="/auth?mode=login" className="cr-btn cr-btn-ghost cr-btn-sm">
                Sign In
              </Link>
              <Link href="/auth?mode=signup" className="cr-btn cr-btn-primary cr-btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
