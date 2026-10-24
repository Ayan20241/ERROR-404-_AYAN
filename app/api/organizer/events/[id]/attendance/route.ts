import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireEventOwnership } from '@/lib/server/auth/guards';
import { parseJsonBody } from '@/lib/server/request-validation';
import {
  attendanceSchema,
  phase5EventIdSchema,
} from '@/lib/server/phase5/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/organizer/events/[id]/attendance', async () => {
    assertSameOrigin(request);
    const { id: eventId } = await context.params;
    if (!phase5EventIdSchema.safeParse(eventId).success) {
      throw new AppError('VALIDATION', 'Event id is invalid.');
    }
    const input = await parseJsonBody(request, attendanceSchema);
    const supabase = await createSupabaseServerClient();
    await requireEventOwnership(supabase, eventId);
    const { data, error } = await supabase.rpc('mark_event_attendance', {
      p_event_id: eventId,
      p_attendee_id: input.attendeeId,
      p_attendance: input.attendanceStatus,
    });
    if (error) {
      mapSupabaseError(error, 'Unable to update attendance.');
    }
    switch (data) {
      case 'attendance_updated':
        return Response.json({
          eventId,
          attendeeId: input.attendeeId,
          result: data,
        });
      case 'event_not_ended':
        throw new AppError(
          'CONFLICT',
          'Attendance can be marked after the event ends.',
        );
      case 'registration_not_found':
        throw new AppError('NOT_FOUND', 'Active registration not found.');
      case 'forbidden':
        throw new AppError('FORBIDDEN', 'You do not own this event.');
      case 'unauthenticated':
        throw new AppError('UNAUTHORIZED', 'Authentication is required.');
      case 'invalid_attendance_status':
        throw new AppError('VALIDATION', 'Attendance status is invalid.');
      default:
        throw new AppError('INTERNAL', 'Unable to update attendance.');
    }
  });
}
