'use client';

import { useState, useEffect, Suspense } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../page.module.css';

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

  return (
    <div style={{ background: '#111', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #333' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.8rem', color: '#fff' }}>
        Welcome
      </h2>
      <Auth
        supabaseClient={supabase}
        view={view}
        appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#00FFE0' } } } }}
        theme="dark"
        providers={[]}
        redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/builder` : undefined}
      />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className={styles.landing} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Loading...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
