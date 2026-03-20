'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Logo from './Branding/Logo';
import { useResume, useResumeDispatch } from '@/context/ResumeContext';
import { translations } from '@/lib/i18n';
import styles from './Navbar.module.css';

export default function Navbar() {
  const resume = useResume();
  const dispatch = useResumeDispatch();
  const t = translations[resume?.language || 'en'];
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

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
        <Link href="/" className={styles.logoLink} onClick={closeMenu}>
          <Logo size="sm" />
        </Link>
        
        <button 
          className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`} 
          onClick={handleMenuToggle}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.menuWrapper} ${isMobileMenuOpen ? styles.mobileMenu : styles.desktopMenu}`}>
          <div className={styles.navLinks}>
            <Link href="/builder" className={styles.navLink} onClick={closeMenu}>{t.navbar.create}</Link>
            <Link href="/cover-letter" className={styles.navLink} onClick={closeMenu}>{t.navbar.coverLetter}</Link>
            <Link href="/pricing" className={styles.navLink} onClick={closeMenu}>{t.navbar.pricing}</Link>
            {user && (
              <Link href="/dashboard" className={styles.navLink} onClick={closeMenu}>{t.navbar.myResumes}</Link>
            )}
          </div>

        <div className={styles.authActions}>
          {loading ? (
             <div className={styles.loading}>...</div>
          ) : user ? (
            <div className={styles.userSection}>
              <select 
                value={resume.language || 'en'} 
                onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                className={styles.langSelect}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
              <span className={styles.userEmail}>{user.email}</span>
              <button 
                onClick={() => { handleSignOut(); closeMenu(); }} 
                className="cr-btn cr-btn-secondary cr-btn-sm"
              >
                {t.navbar.logout}
              </button>
            </div>
          ) : (
            <div className={styles.guestSection}>
              <select 
                value={resume.language || 'en'} 
                onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
                className={styles.langSelect}
                style={{ marginRight: '10px' }}
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
              </select>
              <Link href="/auth?mode=login" className="cr-btn cr-btn-ghost cr-btn-sm" onClick={closeMenu}>
                Sign In
              </Link>
              <Link href="/auth?mode=signup" className="cr-btn cr-btn-primary cr-btn-sm" onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
