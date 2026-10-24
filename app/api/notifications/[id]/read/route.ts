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
  return runApiRoute('/api/notifications/[id]/read', async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    if (!phase5EventIdSchema.safeParse(id).success) {
      throw new AppError('VALIDATION', 'Notification id is invalid.');
    }
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, [
      'attendee',
      'organizer',
      'admin',
    ]);
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', user.id)
      .select('id, read_at')
      .maybeSingle();
    if (error) {
      mapSupabaseError(error, 'Unable to mark notification as read.');
    }
    if (!data) {
      throw new AppError('NOT_FOUND', 'Notification not found.');
    }

    return Response.json({ notification: data });
  });
}
