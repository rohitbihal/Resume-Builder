'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthNav() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return <div className="text-sm op-50">...</div>;
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {user.email}
        </span>
        <button onClick={handleSignOut} className="cr-btn cr-btn-secondary cr-btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Link href="/auth?mode=login" className="cr-btn cr-btn-secondary cr-btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
        Sign In
      </Link>
      <Link href="/auth?mode=signup" className="cr-btn cr-btn-primary cr-btn-sm" style={{ padding: '0.4rem 0.8rem' }}>
        Sign Up
      </Link>
    </div>
  );
}
