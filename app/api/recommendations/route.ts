import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { requireRole } from '@/lib/server/auth/guards';
import { parseQueryParams } from '@/lib/server/request-validation';
import { recommendationQuerySchema } from '@/lib/server/phase5/schemas';
import { getRecommendations } from '@/lib/server/phase5/recommendations';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SmartMatchPreferences } from '@/lib/smartmatch/score';
import { assertValidIndiaLocation } from '@/lib/server/locations/service';

export function GET(request: Request): Promise<Response> {
  return runApiRoute('/api/recommendations', async () => {
    const query = parseQueryParams(
      new URL(request.url).searchParams,
      recommendationQuerySchema,
    );
    const supabase = await createSupabaseServerClient();
    const { user } = await requireRole(supabase, ['attendee']);
    await assertValidIndiaLocation(supabase, query.stateCode, query.cityId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'interests, preferred_categories, preferred_budget, preferred_latitude, preferred_longitude, preferred_radius_km',
      )
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      mapSupabaseError(error, 'Unable to load recommendation preferences.');
    }
    if (!profile) {
      throw new AppError('FORBIDDEN', 'Account preferences are unavailable.');
    }

    const preferences: SmartMatchPreferences = {
      interests: profile.interests ?? [],
      preferred_categories: profile.preferred_categories ?? [],
      preferred_budget: profile.preferred_budget,
      preferred_latitude: query.lat ?? profile.preferred_latitude,
      preferred_longitude: query.lng ?? profile.preferred_longitude,
      preferred_radius_km: query.radiusKm ?? profile.preferred_radius_km ?? 10,
    };
    const results = await getRecommendations(
      supabase,
      user.id,
      preferences,
      new Date(),
      {
        stateCode: query.stateCode,
        cityId: query.cityId,
        locality: query.locality,
      },
    );

    return Response.json({ results });
  });
}
