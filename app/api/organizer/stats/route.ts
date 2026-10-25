import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function GET(): Promise<Response> {
  return runApiRoute('/api/organizer/stats', async () => {
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['organizer']);
    const { data, error } = await supabase.rpc('get_organizer_stats');
    if (error) {
      mapSupabaseError(error, 'Unable to load organizer statistics.');
    }

    return Response.json(data);
  });
}
