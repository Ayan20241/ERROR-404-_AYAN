import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function GET(): Promise<Response> {
  return runApiRoute('/api/admin/stats', async () => {
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['admin']);
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) {
      mapSupabaseError(error, 'Unable to load platform statistics.');
    }

    return Response.json(data);
  });
}
