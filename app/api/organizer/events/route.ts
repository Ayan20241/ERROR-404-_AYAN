import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireRole } from '@/lib/server/auth/guards';
import { parseJsonBody } from '@/lib/server/request-validation';
import { createEventSchema } from '@/lib/server/events/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  assertValidIndiaLocation,
  enrichEventLocations,
} from '@/lib/server/locations/service';

export function GET(): Promise<Response> {
  return runApiRoute('/api/organizer/events', async () => {
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['organizer', 'admin']);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('start_at', { ascending: false })
      .limit(100);

    if (error) {
      mapSupabaseError(error, 'Unable to load organizer events.');
    }

    return Response.json(
      { events: await enrichEventLocations(supabase, data ?? []) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}

export function POST(request: Request): Promise<Response> {
  return runApiRoute('/api/organizer/events', async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, createEventSchema);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['organizer', 'admin']);
    const { publish, state_code, ...eventInput } = input;
    await assertValidIndiaLocation(supabase, state_code, input.city_id);
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventInput,
        organizer_id: user.id,
        status: publish ? 'published' : 'draft',
      })
      .select('*')
      .single();

    if (error) {
      mapSupabaseError(error, 'Event data is invalid.');
    }
    if (!data) {
      throw new AppError('INTERNAL', 'Unable to create event.');
    }

    const [event] = await enrichEventLocations(supabase, [data]);
    return Response.json({ event }, { status: 201 });
  });
}
