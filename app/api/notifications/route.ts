import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { parseQueryParams } from '@/lib/server/request-validation';
import { notificationQuerySchema } from '@/lib/server/phase5/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function GET(request: Request): Promise<Response> {
  return runApiRoute('/api/notifications', async () => {
    const { unread } = parseQueryParams(
      new URL(request.url).searchParams,
      notificationQuerySchema,
    );
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, [
      'attendee',
      'organizer',
      'admin',
    ]);
    let query = supabase
      .from('notifications')
      .select('id, event_id, type, title, message, read_at, created_at')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (unread) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query;
    if (error) {
      mapSupabaseError(error, 'Unable to load notifications.');
    }

    return Response.json({ notifications: data ?? [] });
  });
}
