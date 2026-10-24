import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireEventOwnership } from '@/lib/server/auth/guards';
import {
  mapOrganizerMutationOutcome,
  parseEventId,
} from '@/lib/server/events/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/organizer/events/[id]/cancel', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    await requireEventOwnership(supabase, eventId);
    const { data: outcome, error } = await supabase.rpc('cancel_owned_event', {
      p_event_id: eventId,
    });

    if (error) {
      mapSupabaseError(error, 'Unable to cancel event.');
    }

    return Response.json({
      eventId,
      result: mapOrganizerMutationOutcome(outcome),
      status: 'cancelled',
    });
  });
}
