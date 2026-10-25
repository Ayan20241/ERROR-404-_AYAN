import { AppError } from '@/lib/server/api-errors';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { requireAuthenticatedUser } from '@/lib/server/auth/guards';
import { parseJsonBody } from '@/lib/server/request-validation';
import { profilePatchSchema } from '@/lib/server/events/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export function GET(): Promise<Response> {
  return runApiRoute('/api/me/profile', async () => {
    const supabase = await createSupabaseServerClient();
    const { user } = await requireAuthenticatedUser(supabase);
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, display_name, role, interests, preferred_categories, preferred_budget, preferred_location_label, preferred_latitude, preferred_longitude, preferred_radius_km, created_at, updated_at',
      )
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      mapSupabaseError(error, 'Unable to load profile.');
    }
    if (!data) {
      throw new AppError('NOT_FOUND', 'Profile not found.');
    }

    return Response.json(
      { profile: data },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}

export function PATCH(request: Request): Promise<Response> {
  return runApiRoute('/api/me/profile', async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, profilePatchSchema);
    const supabase = await createSupabaseServerClient();
    const { user } = await requireAuthenticatedUser(supabase);
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', user.id)
      .select(
        'id, display_name, role, interests, preferred_categories, preferred_budget, preferred_location_label, preferred_latitude, preferred_longitude, preferred_radius_km, created_at, updated_at',
      )
      .maybeSingle();

    if (error) {
      mapSupabaseError(error, 'Profile update is invalid.');
    }
    if (!data) {
      throw new AppError('NOT_FOUND', 'Profile not found.');
    }

    return Response.json(
      { profile: data },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
