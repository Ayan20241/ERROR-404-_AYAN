import { NextResponse } from 'next/server';

import { AppError, createApiErrorResponse } from '@/lib/server/api-errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function getSafeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return '/';
  }

  return value;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      throw new AppError('VALIDATION', 'Authentication code is required.');
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new AppError('UNAUTHORIZED', 'Unable to complete authentication.');
    }

    const redirectUrl = new URL(
      getSafeNextPath(requestUrl.searchParams.get('next')),
      requestUrl.origin,
    );
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    return createApiErrorResponse(error, '/api/auth/callback');
  }
}
