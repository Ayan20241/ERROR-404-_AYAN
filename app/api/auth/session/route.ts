import { AppError } from '@/lib/server/api-errors';
import { isUserRole } from '@/lib/server/auth/guards';
import { runAuthRoute } from '@/lib/server/auth/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function GET(): Promise<Response> {
  return runAuthRoute('/api/auth/session', async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? error.status
          : null;

      if (status === 401 || status === 400) {
        return { user: null, role: null };
      }

      throw new AppError('INTERNAL', 'Unable to retrieve the current session.');
    }

    if (!data.user) {
      return { user: null, role: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new AppError('INTERNAL', 'Unable to retrieve account permissions.');
    }

    const role = isUserRole(profile?.role) ? profile.role : null;

    return {
      user: { id: data.user.id, email: data.user.email ?? null },
      role,
    };
  });
}
