import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { parseQueryParams } from '@/lib/server/request-validation';
import { eventSearchQuerySchema } from '@/lib/server/events/search-schema';
import { assertValidIndiaLocation } from '@/lib/server/locations/service';

export function GET(request: Request): Promise<Response> {
  return runApiRoute('/api/events', async () => {
    const query = parseQueryParams(
      new URL(request.url).searchParams,
      eventSearchQuerySchema,
    );
    const supabase = await createSupabaseServerClient();
    await assertValidIndiaLocation(supabase, query.stateCode, query.cityId);
    const { data, error } = await supabase.rpc(
      'search_public_events_by_location',
      {
        p_query: query.q || null,
        p_category: query.category ?? null,
        p_date_from: query.dateFrom ?? null,
        p_date_to: query.dateTo ?? null,
        p_max_price: query.maxPrice ?? null,
        p_latitude: query.lat ?? null,
        p_longitude: query.lng ?? null,
        p_radius_km: query.radiusKm ?? null,
        p_page: query.page,
        p_page_size: query.pageSize,
        p_state_code: query.stateCode ?? null,
        p_city_id: query.cityId ?? null,
        p_locality: query.locality ?? null,
      },
    );

    if (error) {
      mapSupabaseError(error, 'Unable to load events.');
    }
    if (
      !data ||
      typeof data !== 'object' ||
      !('events' in data) ||
      !('total' in data)
    ) {
      throw new AppError(
        'INTERNAL',
        'Event search returned an invalid response.',
      );
    }

    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  });
}
