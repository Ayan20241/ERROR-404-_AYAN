import { AppError } from '@/lib/server/api-errors';
import { assertSameOrigin, runAuthRoute } from '@/lib/server/auth/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function POST(request: Request): Promise<Response> {
  return runAuthRoute('/api/auth/signout', async () => {
    assertSameOrigin(request);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AppError('INTERNAL', 'Unable to sign out.');
    }

    return { signedOut: true };
  });
}
