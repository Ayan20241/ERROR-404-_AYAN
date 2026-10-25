import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireEventOwnership } from '@/lib/server/auth/guards';
import { parseEventId } from '@/lib/server/events/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/organizer/events/[id]/attendees', async () => {
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    await requireEventOwnership(supabase, eventId);
    const { data, error } = await supabase
      .from('organizer_event_attendees')
      .select(
        'event_id, attendee_id, display_name, registration_status, attendance_status, registered_at',
      )
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false })
      .limit(500);

    if (error) {
      mapSupabaseError(error, 'Unable to load event attendees.');
    }

    return Response.json(
      { attendees: data ?? [] },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
