import type { SupabaseClient } from '@supabase/supabase-js';

import { AppError } from '@/lib/server/api-errors';
import type {
  EventLocationFields,
  IndiaCity,
  IndiaDivision,
} from '@/lib/locations/types';

export async function listIndiaDivisions(
  supabase: SupabaseClient,
): Promise<IndiaDivision[]> {
  const { data, error } = await supabase
    .from('india_admin_divisions')
    .select('code, name, kind, country_code')
    .order('name');

  if (error) {
    throw new AppError(
      'INTERNAL',
      'Unable to load Indian states and territories.',
    );
  }
  return (data ?? []) as IndiaDivision[];
}

export async function listIndiaCities(
  supabase: SupabaseClient,
  divisionCode: string,
  search = '',
): Promise<IndiaCity[]> {
  const division = await supabase
    .from('india_admin_divisions')
    .select('code')
    .eq('code', divisionCode)
    .maybeSingle();

  if (division.error) {
    throw new AppError(
      'INTERNAL',
      'Unable to validate the selected state or territory.',
    );
  }
  if (!division.data) {
    throw new AppError(
      'VALIDATION',
      'Select a valid Indian state or territory.',
    );
  }

  let query = supabase
    .from('india_cities')
    .select('id, name, division_code, country_code')
    .eq('division_code', divisionCode)
    .order('name');

  if (search) {
    const escapedSearch = search.replace(/[\\%_]/g, '\\$&');
    query = query.ilike('name', `%${escapedSearch}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new AppError(
      'INTERNAL',
      'Unable to load cities for the selected state or territory.',
    );
  }
  return (data ?? []) as IndiaCity[];
}

export async function listEventLocalities(
  supabase: SupabaseClient,
  cityId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('events')
    .select('locality')
    .eq('city_id', cityId)
    .eq('country_code', 'IN')
    .not('locality', 'is', null)
    .order('locality')
    .limit(200);

  if (error) {
    throw new AppError('INTERNAL', 'Unable to load locality suggestions.');
  }
  return [
    ...new Set(
      (data ?? [])
        .map((row) => row.locality)
        .filter((value): value is string => typeof value === 'string'),
    ),
  ];
}

export async function assertValidIndiaLocation(
  supabase: SupabaseClient,
  divisionCode: string | undefined,
  cityId: string | undefined,
): Promise<void> {
  if (!cityId) {
    if (divisionCode) {
      const { data, error } = await supabase
        .from('india_admin_divisions')
        .select('code')
        .eq('code', divisionCode)
        .maybeSingle();
      if (error) {
        throw new AppError(
          'INTERNAL',
          'Unable to validate the selected state or territory.',
        );
      }
      if (!data) {
        throw new AppError(
          'VALIDATION',
          'Select a valid Indian state or territory.',
        );
      }
    }
    return;
  }

  if (!divisionCode) {
    throw new AppError(
      'VALIDATION',
      'Select a state or territory before choosing a city.',
    );
  }
  const { data, error } = await supabase
    .from('india_cities')
    .select('id')
    .eq('id', cityId)
    .eq('division_code', divisionCode)
    .maybeSingle();

  if (error) {
    throw new AppError('INTERNAL', 'Unable to validate the selected city.');
  }
  if (!data) {
    throw new AppError(
      'VALIDATION',
      'The selected city does not belong to that state or territory.',
    );
  }
}

export async function enrichEventLocations<T extends object>(
  supabase: SupabaseClient,
  events: T[],
): Promise<Array<T & EventLocationFields>> {
  const locationEvents = events as Array<T & EventLocationFields>;
  const cityIds = [
    ...new Set(
      locationEvents
        .map((event) => event.city_id)
        .filter((cityId): cityId is string => typeof cityId === 'string'),
    ),
  ];
  if (cityIds.length === 0) {
    return locationEvents.map((event) => ({
      ...event,
      city_name: null,
      state_code: null,
      state_name: null,
      state_kind: null,
    }));
  }

  const { data: cities, error: cityError } = await supabase
    .from('india_cities')
    .select('id, name, division_code')
    .in('id', cityIds);
  if (cityError) {
    throw new AppError('INTERNAL', 'Unable to load event location details.');
  }
  const divisionCodes = [
    ...new Set((cities ?? []).map((city) => city.division_code)),
  ];
  const { data: divisions, error: divisionError } = await supabase
    .from('india_admin_divisions')
    .select('code, name, kind')
    .in('code', divisionCodes);
  if (divisionError) {
    throw new AppError('INTERNAL', 'Unable to load event location details.');
  }

  const cityById = new Map((cities ?? []).map((city) => [city.id, city]));
  const divisionByCode = new Map(
    (divisions ?? []).map((division) => [division.code, division]),
  );
  return locationEvents.map((event) => {
    const city = event.city_id ? cityById.get(event.city_id) : undefined;
    const division = city ? divisionByCode.get(city.division_code) : undefined;
    return {
      ...event,
      city_name: city?.name ?? null,
      state_code: division?.code ?? null,
      state_name: division?.name ?? null,
      state_kind: division?.kind ?? null,
    };
  });
}
