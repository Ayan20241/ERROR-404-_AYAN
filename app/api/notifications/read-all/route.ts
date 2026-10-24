import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function POST(request: Request): Promise<Response> {
  return runApiRoute('/api/notifications/read-all', async () => {
    assertSameOrigin(request);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, [
      'attendee',
      'organizer',
      'admin',
    ]);
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .is('read_at', null)
      .select('id');
    if (error) {
      mapSupabaseError(error, 'Unable to mark notifications as read.');
    }

    return Response.json({ updated: data?.length ?? 0 });
  });
}
