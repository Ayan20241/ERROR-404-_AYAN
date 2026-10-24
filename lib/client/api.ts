export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | undefined,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiRequest<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiRequestError(
      'Could not reach the server. Check your connection and try again.',
      0,
      'NETWORK',
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError(
      'The server returned an unreadable response.',
      response.status,
      'INVALID_RESPONSE',
    );
  }

  if (!response.ok) {
    const error = payload as ApiErrorBody;
    throw new ApiRequestError(
      error.error?.message ?? 'The request could not be completed.',
      response.status,
      error.error?.code,
    );
  }

  return payload as T;
}

export interface SessionResponse {
  user: { id: string; email: string | null } | null;
  role: 'attendee' | 'organizer' | 'admin' | null;
}

export interface EventRecord {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  venue_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  start_at: string;
  end_at: string;
  price: number;
  currency: string;
  capacity: number;
  registered_count: number;
  registration_deadline: string | null;
  image_url: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  country_code?: 'IN' | null;
  city_id?: string | null;
  locality?: string | null;
  city_name?: string | null;
  state_code?: string | null;
  state_name?: string | null;
  state_kind?: 'state' | 'union_territory' | null;
}

export function formatEventLocation(event: EventRecord): string {
  const location = [event.locality, event.city_name, event.state_name].filter(
    (part): part is string => Boolean(part),
  );
  return location.length ? location.join(', ') : 'Location not provided';
}

export const EVENT_CATEGORIES = [
  'Technology',
  'Music',
  'Food & Drink',
  'Sports & Fitness',
  'Arts & Culture',
  'Business & Networking',
  'Education & Workshops',
  'Community',
  'Health & Wellness',
  'Other',
] as const;

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export interface EventSearchFilters {
  q: string;
  category: string;
  date: string;
  maxPrice: string;
  latitude: string;
  longitude: string;
  radiusKm: string;
  stateCode: string;
  cityId: string;
  locality: string;
}

export function buildEventSearchParams(
  page: number,
  filters: EventSearchFilters,
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: '12',
  });
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.category) params.set('category', filters.category);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.cityId && !filters.stateCode) {
    throw new Error('Choose a state or territory before filtering by city.');
  }
  if (filters.locality.trim() && !filters.cityId) {
    throw new Error('Choose a city before filtering by locality.');
  }
  if (filters.cityId && !filters.cityId.startsWith(`${filters.stateCode}-`)) {
    throw new Error('The selected city does not match the selected state.');
  }
  if (filters.stateCode) params.set('stateCode', filters.stateCode);
  if (filters.cityId) params.set('cityId', filters.cityId);
  if (filters.locality.trim()) params.set('locality', filters.locality.trim());
  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00`);
    const end = new Date(`${filters.date}T23:59:59.999`);
    params.set('dateFrom', start.toISOString());
    params.set('dateTo', end.toISOString());
  }
  const hasLatitude = filters.latitude !== '';
  const hasLongitude = filters.longitude !== '';
  if (hasLatitude !== hasLongitude) {
    throw new Error('Enter both latitude and longitude to filter by distance.');
  }
  if (filters.radiusKm && !hasLatitude) {
    throw new Error('Set a location before applying a search radius.');
  }
  if (hasLatitude && hasLongitude) {
    const latitude = Number(filters.latitude);
    const longitude = Number(filters.longitude);
    const radius = filters.radiusKm ? Number(filters.radiusKm) : undefined;
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90.');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180.');
    }
    if (radius !== undefined && (!Number.isFinite(radius) || radius <= 0)) {
      throw new Error('Search radius must be a positive number of kilometers.');
    }
    params.set('lat', String(latitude));
    params.set('lng', String(longitude));
    if (radius !== undefined) params.set('radiusKm', String(radius));
  }
  return params;
}
