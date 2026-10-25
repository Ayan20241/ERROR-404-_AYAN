import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { parseQueryParams } from '@/lib/server/request-validation';
import { paginationQuerySchema } from '@/lib/server/phase5/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { enrichEventLocations } from '@/lib/server/locations/service';
import type { EventLocationFields } from '@/lib/locations/types';

interface AdminEventRow {
  event: EventLocationFields & Record<string, unknown>;
  flagged: boolean;
}

export function GET(request: Request): Promise<Response> {
  return runApiRoute('/api/admin/events', async () => {
    const pagination = parseQueryParams(
      new URL(request.url).searchParams,
      paginationQuerySchema,
    );
    const supabase = await createSupabaseServerClient();
    await requireRole(supabase, ['admin']);
    const { data, error } = await supabase.rpc('list_admin_events', {
      p_page: pagination.page,
      p_page_size: pagination.pageSize,
    });
    if (error) {
      mapSupabaseError(error, 'Unable to load moderation events.');
    }
    const result = data as { events: AdminEventRow[]; total: number };
    const events = await enrichEventLocations(
      supabase,
      result.events.map((row) => row.event),
    );
    return Response.json({
      ...result,
      events: result.events.map((row, index) => ({
        ...row,
        event: events[index],
      })),
    });
  });
}
