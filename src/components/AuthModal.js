'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && isOpen) onClose(); // Close if already logged in
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && isOpen) onClose();
    });

    return () => subscription.unsubscribe();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <div className={styles.authContainer}>
          <h2 className={styles.authTitle}>Sign In to Save</h2>
          <p className={styles.authDesc}>Create an account or sign in to save your resume progress and download PDFs.</p>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6C5CE7',
                    brandAccent: '#A855F7',
                    inputText: 'white',
                    inputBackground: '#1A1A24',
                    inputBorder: '#2A2A35',
                  },
                },
              },
              className: {
                button: styles.supabaseButton,
                input: styles.supabaseInput,
              }
            }}
            providers={['google', 'github']}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
}
