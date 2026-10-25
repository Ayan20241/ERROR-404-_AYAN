import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import {
  parseEventId,
  mapRegistrationOutcome,
} from '@/lib/server/events/route-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]/register', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['attendee']);
    const { data: outcome, error } = await supabase.rpc('register_for_event', {
      p_event_id: eventId,
    });

    if (error) {
      mapSupabaseError(error, 'Unable to register for this event.');
    }
    mapRegistrationOutcome(outcome);

    const { data, error: registrationError } = await supabase
      .from('registrations')
      .select(
        'id, event_id, attendee_id, status, attendance_status, registered_at',
      )
      .eq('event_id', eventId)
      .eq('attendee_id', user.id)
      .eq('status', 'registered')
      .maybeSingle();

    if (registrationError) {
      mapSupabaseError(registrationError, 'Unable to load registration.');
    }
    if (!data) {
      throw new AppError(
        'INTERNAL',
        'Registration was created but could not be loaded.',
      );
    }

    return Response.json({ registration: data }, { status: 201 });
  });
}

export function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]/register', async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const eventId = parseEventId(rawId);
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['attendee']);
    const { data: outcome, error } = await supabase.rpc(
      'cancel_event_registration',
      { p_event_id: eventId },
    );

    if (error) {
      mapSupabaseError(error, 'Unable to cancel this registration.');
    }
    const result = mapRegistrationOutcome(outcome);

    return Response.json(
      {
        registration: { event_id: eventId, status: 'cancelled' },
        result,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
