'use client';

import { useState, useEffect, Suspense } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './AuthPage.module.css';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [view, setView] = useState(mode === 'signup' ? 'sign_up' : 'sign_in');

  useEffect(() => {
    setView(mode === 'signup' ? 'sign_up' : 'sign_in');
  }, [mode]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/builder');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/builder');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error('Error signing in with Google:', error.message);
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>Welcome</h2>
      
      <Auth
        supabaseClient={supabase}
        view={view}
        appearance={{ 
          theme: ThemeSupa, 
          variables: { 
            default: { 
              colors: { 
                brand: '#4c6ef5',
                brandAccent: '#15aabf',
                inputText: 'var(--cr-text-primary)',
                inputBackground: 'var(--cr-bg-card)',
                inputBorder: 'var(--cr-border)',
                inputPlaceholder: 'var(--cr-text-muted)',
              } 
            } 
          } 
        }}
        theme="light"
        providers={[]}
      />

      <div className={styles.separator}>
        <span>─── or ───</span>
      </div>

      <button className={styles.googleButton} onClick={signInWithGoogle}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--cr-bg-secondary)',
      padding: '1rem'
    }}>
      <Suspense fallback={<div style={{ color: 'var(--cr-text-muted)' }}>Loading...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
