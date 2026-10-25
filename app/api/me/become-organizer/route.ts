import { createSupabaseServerClient } from '@/lib/supabase/server';
import { runApiRoute, mapSupabaseError } from '@/lib/server/api-route';
import { assertSameOrigin } from '@/lib/server/auth/route-utils';
import { mapOrganizerMutationOutcome } from '@/lib/server/events/route-utils';

export function POST(request: Request): Promise<Response> {
  return runApiRoute('/api/me/become-organizer', async () => {
    assertSameOrigin(request);
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('become_organizer');
    if (error) {
      mapSupabaseError(error, 'Unable to update account role.');
    }

    const result = mapOrganizerMutationOutcome(data);
    return Response.json(
      { role: 'organizer', result },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  });
}
