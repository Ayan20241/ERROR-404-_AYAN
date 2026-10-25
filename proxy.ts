import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import {
  EnvironmentConfigurationError,
  parseSupabasePublicEnvironment,
  type SupabasePublicEnvironment,
} from '@/lib/env/schema';

export async function proxy(request: NextRequest) {
  let environment: SupabasePublicEnvironment;
  try {
    environment = parseSupabasePublicEnvironment(process.env);
  } catch (error) {
    if (!(error instanceof EnvironmentConfigurationError)) {
      throw error;
    }

    return NextResponse.json(
      {
        error: {
          code: 'CONFIGURATION',
          message:
            'Application configuration is incomplete. Correct the listed environment variables.',
          variables: error.invalidVariables,
        },
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
          }
        },
      },
    },
  );

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    '/((?!api/health$|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
