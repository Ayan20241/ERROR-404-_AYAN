import { parseJsonBody } from '@/lib/server/request-validation';
import { signUpSchema } from '@/lib/server/auth/schemas';
import { parseSupabasePublicEnvironment } from '@/lib/env/schema';
import {
  assertSameOrigin,
  authFailure,
  runAuthRoute,
} from '@/lib/server/auth/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function POST(request: Request): Promise<Response> {
  return runAuthRoute('/api/auth/signup', async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, signUpSchema);
    const environment = parseSupabasePublicEnvironment(process.env);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${environment.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        data: input.displayName ? { display_name: input.displayName } : {},
      },
    });

    if (error) {
      authFailure(error, 'signUp');
    }

    return {
      user: { id: data.user?.id ?? null, email: data.user?.email ?? null },
      authenticated: data.session !== null,
    };
  });
}
