import { createBrowserClient } from '@supabase/ssr';

// These will be pulled from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Global client instance - use createBrowserClient for better SSR integration
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase client not initialized: Missing environment variables.');
}

/**
 * Helper to get the current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('Error getting session:', error);
  return session;
}

/**
 * Helper to get the current user
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.error('Error getting user:', error);
  return user;
}

/**
 * Helper to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
}
