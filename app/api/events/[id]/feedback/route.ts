import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import { parseJsonBody } from '@/lib/server/request-validation';
import {
  feedbackSchema,
  phase5EventIdSchema,
} from '@/lib/server/phase5/schemas';
import { AppError } from '@/lib/server/api-errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/events/[id]/feedback', async () => {
    assertSameOrigin(request);
    const { id: eventId } = await context.params;
    if (!phase5EventIdSchema.safeParse(eventId).success) {
      throw new AppError('VALIDATION', 'Event id is invalid.');
    }
    const input = await parseJsonBody(request, feedbackSchema);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['attendee']);
    const { data, error } = await supabase
      .from('event_feedback')
      .insert({
        event_id: eventId,
        attendee_id: user.id,
        rating: input.rating,
        comment: input.comment ?? null,
      })
      .select('id, event_id, rating, comment, created_at')
      .single();

    if (error) {
      mapSupabaseError(
        error,
        'Feedback is not eligible or was already submitted.',
      );
    }

    return Response.json({ feedback: data }, { status: 201 });
  });
}
