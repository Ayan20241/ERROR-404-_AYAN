import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import { phase5EventIdSchema } from '@/lib/server/phase5/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  return runApiRoute('/api/admin/events/[id]/remove', async () => {
    assertSameOrigin(request);
    const { id: eventId } = await context.params;
    if (!phase5EventIdSchema.safeParse(eventId).success) {
      throw new AppError('VALIDATION', 'Event id is invalid.');
    }
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['admin']);
    const { data, error } = await supabase.rpc('admin_remove_event', {
      p_event_id: eventId,
    });
    if (error) {
      mapSupabaseError(error, 'Unable to moderate event.');
    }
    if (data === 'event_not_found') {
      throw new AppError('NOT_FOUND', 'Event not found.');
    }
    if (data === 'forbidden') {
      throw new AppError('FORBIDDEN', 'Administrator access is required.');
    }
    if (data !== 'removed' && data !== 'already_removed') {
      throw new AppError('INTERNAL', 'Unable to moderate event.');
    }

    return Response.json({ eventId, result: data });
  });
}
