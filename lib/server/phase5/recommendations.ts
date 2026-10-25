import type { SupabaseClient } from '@supabase/supabase-js';

import {
  scoreEvent,
  type ScorableEvent,
  type SmartMatchPreferences,
} from '@/lib/smartmatch/score';
import { AppError } from '@/lib/server/api-errors';
import {
  enrichEventLocations,
  listIndiaCities,
} from '@/lib/server/locations/service';
import type { EventLocationFields } from '@/lib/locations/types';

interface RecommendationLocationFilter {
  stateCode?: string;
  cityId?: string;
  locality?: string;
}

interface RecommendationEvent extends ScorableEvent, EventLocationFields {
  description: string;
  venue_name: string | null;
  address: string | null;
  image_url: string | null;
  currency: string;
  organizer_id: string;
}

export async function getRecommendations(
  supabase: SupabaseClient,
  attendeeId: string,
  preferences: SmartMatchPreferences,
  now = new Date(),
  locationFilter: RecommendationLocationFilter = {},
) {
  const cityIds = locationFilter.cityId
    ? [locationFilter.cityId]
    : locationFilter.stateCode
      ? (await listIndiaCities(supabase, locationFilter.stateCode)).map(
          (city) => city.id,
        )
      : undefined;
  if (cityIds?.length === 0) return [];

  let firstPageQuery = supabase
    .from('events')
    .select(
      'id, title, description, category, status, start_at, end_at, registration_deadline, price, currency, capacity, registered_count, latitude, longitude, venue_name, address, image_url, organizer_id, country_code, city_id, locality',
    )
    .eq('status', 'published')
    .gte('end_at', now.toISOString())
    .order('start_at', { ascending: true })
    .range(0, 499);
  if (cityIds) firstPageQuery = firstPageQuery.in('city_id', cityIds);
  if (locationFilter.locality)
    firstPageQuery = firstPageQuery.eq('locality', locationFilter.locality);

  const [registrationResult, firstPage] = await Promise.all([
    supabase
      .from('registrations')
      .select('event_id')
      .eq('attendee_id', attendeeId)
      .eq('status', 'registered'),
    firstPageQuery,
  ]);

  if (registrationResult.error) {
    throw new AppError('INTERNAL', 'Unable to load registered events.');
  }
  if (firstPage.error) {
    throw new AppError('INTERNAL', 'Unable to load recommendation candidates.');
  }

  const events = [...(firstPage.data ?? [])] as RecommendationEvent[];
  if (events.length === 500) {
    let offset = 500;
    while (true) {
      let candidateQuery = supabase
        .from('events')
        .select(
          'id, title, description, category, status, start_at, end_at, registration_deadline, price, currency, capacity, registered_count, latitude, longitude, venue_name, address, image_url, organizer_id, country_code, city_id, locality',
        )
        .eq('status', 'published')
        .gte('end_at', now.toISOString())
        .order('start_at', { ascending: true })
        .range(offset, offset + 499);
      if (cityIds) candidateQuery = candidateQuery.in('city_id', cityIds);
      if (locationFilter.locality)
        candidateQuery = candidateQuery.eq('locality', locationFilter.locality);
      const { data, error } = await candidateQuery;

      if (error) {
        throw error;
      }
      const page = (data ?? []) as RecommendationEvent[];
      events.push(...page);
      if (page.length < 500) {
        break;
      }
      offset += 500;
    }
  }

  const locatedEvents = await enrichEventLocations(supabase, events);
  const registeredIds = new Set(
    (registrationResult.data ?? []).map(
      (registration) => registration.event_id,
    ),
  );
  const scored = locatedEvents
    .filter((event) => !registeredIds.has(event.id))
    .flatMap((event) => {
      const result = scoreEvent(event, preferences, now);
      if (!result) {
        return [];
      }
      return [
        {
          event,
          score: result.score,
          reasons:
            result.reasons.length > 0
              ? result.reasons
              : ['Upcoming event with available capacity.'],
        },
      ];
    });

  const hasPreferences =
    preferences.interests.length > 0 ||
    preferences.preferred_categories.length > 0 ||
    preferences.preferred_budget !== null ||
    preferences.preferred_latitude !== null;

  scored.sort((first, second) => {
    if (!hasPreferences) {
      return (
        second.event.registered_count - first.event.registered_count ||
        Date.parse(first.event.start_at) - Date.parse(second.event.start_at) ||
        first.event.id.localeCompare(second.event.id)
      );
    }
    return (
      second.score - first.score ||
      Date.parse(first.event.start_at) - Date.parse(second.event.start_at) ||
      first.event.id.localeCompare(second.event.id)
    );
  });

  return scored.slice(0, 48);
}
