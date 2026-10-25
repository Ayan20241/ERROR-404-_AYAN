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
  return runApiRoute('/api/admin/events/[id]/restore', async () => {
    assertSameOrigin(request);
    const { id: eventId } = await context.params;
    if (!phase5EventIdSchema.safeParse(eventId).success) {
      throw new AppError('VALIDATION', 'Event id is invalid.');
    }
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['admin']);
    const { data, error } = await supabase.rpc('admin_restore_event', {
      p_event_id: eventId,
    });
    if (error) {
      mapSupabaseError(error, 'Unable to restore event.');
    }
    if (data === 'not_flagged') {
      throw new AppError('NOT_FOUND', 'Moderated event not found.');
    }
    if (data === 'forbidden') {
      throw new AppError('FORBIDDEN', 'Administrator access is required.');
    }
    if (data !== 'restored') {
      throw new AppError('INTERNAL', 'Unable to restore event.');
    }

    return Response.json({ eventId, result: data });
  });
}
