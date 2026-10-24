import { parseJsonBody } from '@/lib/server/request-validation';
import { signInSchema } from '@/lib/server/auth/schemas';
import {
  assertSameOrigin,
  authFailure,
  runAuthRoute,
} from '@/lib/server/auth/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function POST(request: Request): Promise<Response> {
  return runAuthRoute('/api/auth/signin', async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, signInSchema);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);

    if (error) {
      authFailure(error, 'signIn');
    }

    return {
      user: { id: data.user.id, email: data.user.email ?? null },
    };
  });
}
