import { runApiRoute } from '@/lib/server/api-route';
import {
  listEventLocalities,
  listIndiaCities,
  listIndiaDivisions,
} from '@/lib/server/locations/service';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/server/api-errors';

export function GET(request: Request): Promise<Response> {
  return runApiRoute('/api/locations', async () => {
    const searchParams = new URL(request.url).searchParams;
    const stateCode = searchParams.get('stateCode') ?? undefined;
    const cityId = searchParams.get('cityId') ?? undefined;
    const query = searchParams.get('q')?.trim() ?? '';
    if (query.length > 80 || (cityId && !stateCode)) {
      throw new AppError('VALIDATION', 'Location query is invalid.');
    }
    const supabase = await createSupabaseServerClient();
    if (cityId) {
      if (!stateCode) {
        throw new AppError(
          'VALIDATION',
          'Choose a state or territory for the selected city.',
        );
      }
      const { data: city, error } = await supabase
        .from('india_cities')
        .select('id')
        .eq('id', cityId)
        .eq('division_code', stateCode)
        .maybeSingle();
      if (error)
        throw new AppError('INTERNAL', 'Unable to validate the selected city.');
      if (!city)
        throw new AppError(
          'VALIDATION',
          'The selected city does not belong to that state or territory.',
        );
      return Response.json({
        localities: await listEventLocalities(supabase, cityId),
      });
    }

    if (stateCode) {
      return Response.json({
        cities: await listIndiaCities(supabase, stateCode, query),
      });
    }
    return Response.json({ divisions: await listIndiaDivisions(supabase) });
  });
}
