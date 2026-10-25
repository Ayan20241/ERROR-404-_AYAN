import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { enrichEventLocations } from '@/lib/server/locations/service';

export function GET(): Promise<Response> {
  return runApiRoute('/api/me/registrations', async () => {
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['attendee']);
    const { data, error } = await supabase
      .from('registrations')
      .select(
        'id, event_id, status, attendance_status, registered_at, event:events(id, title, category, start_at, end_at, venue_name, address, image_url, price, currency, status, country_code, city_id, locality)',
      )
      .eq('attendee_id', user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      mapSupabaseError(error, 'Unable to load your registrations.');
    }

    const rows = data ?? [];
    const eventRows = rows
      .flatMap((row) => (row.event ? [row.event] : []))
      .flat();
    const locatedEvents = await enrichEventLocations(supabase, eventRows);
    let eventIndex = 0;
    const registrations = rows.map((row) => ({
      ...row,
      event: row.event ? locatedEvents[eventIndex++] : null,
    }));

    return Response.json(
      { registrations },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
