import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireEventOwnership } from '@/lib/server/auth/guards';
import { parseJsonBody } from '@/lib/server/request-validation';
import { updateEventSchema } from '@/lib/server/events/schemas';
import {
  mapOrganizerMutationOutcome,
  parseEventId,
} from '@/lib/server/events/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  assertValidIndiaLocation,
  enrichEventLocations,
} from '@/lib/server/locations/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/organizer/events/[id]', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const parsedChanges = await parseJsonBody(request, updateEventSchema);
    const supabase = await createSupabaseServerClient();
    await requireEventOwnership(supabase, eventId);
    const { state_code, ...changes } = parsedChanges;
    await assertValidIndiaLocation(supabase, state_code, changes.city_id);
    const { data: outcome, error } = await supabase.rpc('update_owned_event', {
      p_event_id: eventId,
      p_changes: changes,
    });

    if (error) {
      mapSupabaseError(error, 'Event changes are invalid.');
    }
    const result = mapOrganizerMutationOutcome(outcome);

    const { data, error: readError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();
    if (readError) {
      mapSupabaseError(readError, 'Unable to load updated event.');
    }
    if (!data) {
      throw new AppError('NOT_FOUND', 'Event not found.');
    }
    const [event] = await enrichEventLocations(supabase, [data]);
    return Response.json({ event, result });
  });
}
