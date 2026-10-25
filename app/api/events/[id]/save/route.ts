import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import { parseEventId } from '@/lib/server/events/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]/save', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['attendee']);
    const { data, error } = await supabase.rpc('save_event', {
      p_event_id: eventId,
    });
    if (error) {
      mapSupabaseError(error, 'Unable to save this event.');
    }
    if (data === 'event_not_found') {
      throw new AppError('NOT_FOUND', 'Published event not found.');
    }
    if (data !== 'saved') {
      throw new AppError('INTERNAL', 'The event could not be saved.');
    }

    return Response.json({ eventId, saved: true });
  });
}

export function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]/save', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['attendee']);
    const { error } = await supabase
      .from('saved_events')
      .delete()
      .eq('attendee_id', user.id)
      .eq('event_id', eventId);
    if (error) {
      mapSupabaseError(error, 'Unable to remove this saved event.');
    }

    return Response.json({ eventId, saved: false });
  });
}
