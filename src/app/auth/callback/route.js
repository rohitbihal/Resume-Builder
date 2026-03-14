import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Robust origin detection for Vercel/Production
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const origin = `${forwardedProto}://${host}`;

  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (errorParam) {
    console.error('OAuth: Provider error:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('OAuth: Session exchanged successfully');
      return response;
    } else {
      console.error('OAuth: Code exchange error:', error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    console.warn('OAuth: No code found in query parameters. URL:', request.url);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No+authentication+code+received`);
  }
}
