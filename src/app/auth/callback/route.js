import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // if "next" is in search params, use it as the redirect URL
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Robust origin detection for Vercel/Production
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const origin = `${forwardedProto}://${host}`;

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
      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
