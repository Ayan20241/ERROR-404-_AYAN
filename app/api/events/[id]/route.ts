import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { parseEventId } from '@/lib/server/events/route-utils';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { enrichEventLocations } from '@/lib/server/locations/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]', async () => {
    const { id: rawId } = await context.params;
    const id = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      mapSupabaseError(error, 'Unable to load event.');
    }
    if (!data) {
      throw new AppError('NOT_FOUND', 'Event not found.');
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      const status = 'status' in authError ? authError.status : undefined;
      if (status !== 400 && status !== 401) {
        throw new AppError(
          'INTERNAL',
          'Unable to verify the signed-in event viewer.',
        );
      }
    } else if (user) {
      const admin = createSupabaseAdminClient();
      const { error: viewError } = await admin.rpc('record_event_view', {
        p_event_id: id,
        p_viewer_id: user.id,
      });
      if (viewError) {
        mapSupabaseError(viewError, 'Unable to record event view.');
      }
    }

    const [event] = await enrichEventLocations(supabase, [data]);
    return Response.json(
      { event },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
