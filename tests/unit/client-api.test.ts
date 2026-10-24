import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApiRequestError,
  apiRequest,
  buildEventSearchParams,
  type EventSearchFilters,
} from '@/lib/client/api';
import { authFormSchema } from '@/lib/client/auth-form-schema';

const emptyFilters: EventSearchFilters = {
  q: '',
  category: '',
  date: '',
  maxPrice: '',
  latitude: '',
  longitude: '',
  radiusKm: '',
  stateCode: '',
  cityId: '',
  locality: '',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('uses same-origin credentials and disables caching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest<{ ok: boolean }>('/api/example')).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/example',
      expect.objectContaining({
        credentials: 'same-origin',
        cache: 'no-store',
      }),
    );
  });

  it('surfaces structured API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: { code: 'UNAUTHORIZED', message: 'Sign in required.' } },
            { status: 401 },
          ),
        ),
    );

    await expect(apiRequest('/api/private')).rejects.toMatchObject({
      name: 'ApiRequestError',
      message: 'Sign in required.',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it('reports network failures without exposing underlying details', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('internal detail')),
    );

    await expect(apiRequest('/api/example')).rejects.toEqual(
      expect.objectContaining<ApiRequestError>({
        name: 'ApiRequestError',
        message:
          'Could not reach the server. Check your connection and try again.',
        status: 0,
        code: 'NETWORK',
      }),
    );
  });
});

describe('buildEventSearchParams', () => {
  it('maps supported discovery filters to the event API contract', () => {
    const params = buildEventSearchParams(2, {
      ...emptyFilters,
      q: '  ceramics  ',
      category: 'Arts & Culture',
      maxPrice: '25',
      latitude: '40.1',
      longitude: '-73.9',
      radiusKm: '8',
    });

    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('12');
    expect(params.get('q')).toBe('ceramics');
    expect(params.get('category')).toBe('Arts & Culture');
    expect(params.get('maxPrice')).toBe('25');
    expect(params.get('lat')).toBe('40.1');
    expect(params.get('lng')).toBe('-73.9');
    expect(params.get('radiusKm')).toBe('8');
  });

  it('includes state, city, and locality in shareable location queries', () => {
    const params = buildEventSearchParams(1, {
      ...emptyFilters,
      stateCode: 'IN-KA',
      cityId: 'IN-KA-BENGALURU',
      locality: 'Indiranagar',
    });

    expect(params.get('stateCode')).toBe('IN-KA');
    expect(params.get('cityId')).toBe('IN-KA-BENGALURU');
    expect(params.get('locality')).toBe('Indiranagar');
  });

  it('creates an inclusive single-day date range', () => {
    const params = buildEventSearchParams(1, {
      ...emptyFilters,
      date: '2026-05-13',
    });

    expect(Date.parse(params.get('dateFrom')!)).toBeLessThan(
      Date.parse(params.get('dateTo')!),
    );
    expect(new Date(params.get('dateFrom')!).getDate()).toBe(13);
    expect(new Date(params.get('dateTo')!).getDate()).toBe(13);
  });

  it('rejects partial or invalid coordinates instead of querying unintended locations', () => {
    expect(() =>
      buildEventSearchParams(1, { ...emptyFilters, latitude: '40' }),
    ).toThrow('Enter both latitude and longitude');
    expect(() =>
      buildEventSearchParams(1, {
        ...emptyFilters,
        latitude: '90.1',
        longitude: '-73',
      }),
    ).toThrow('Latitude must be between -90 and 90');
  });

  it('rejects city or locality filters without a matching parent selection', () => {
    expect(() =>
      buildEventSearchParams(1, {
        ...emptyFilters,
        cityId: 'IN-KA-BENGALURU',
      }),
    ).toThrow('Choose a state or territory');
    expect(() =>
      buildEventSearchParams(1, {
        ...emptyFilters,
        stateCode: 'IN-MH',
        cityId: 'IN-KA-BENGALURU',
      }),
    ).toThrow('does not match');
    expect(() =>
      buildEventSearchParams(1, {
        ...emptyFilters,
        locality: 'Indiranagar',
      }),
    ).toThrow('Choose a city');
  });
});

describe('authFormSchema', () => {
  it('normalizes valid auth fields and rejects invalid email or blank passwords', () => {
    expect(
      authFormSchema.parse({
        email: ' person@example.test ',
        password: 'password',
      }),
    ).toEqual({
      email: 'person@example.test',
      password: 'password',
    });
    expect(
      authFormSchema.safeParse({
        email: 'not-an-email',
        password: '',
      }).success,
    ).toBe(false);
  });

  it('requires a nonblank display name when signing up', () => {
    expect(
      authFormSchema.safeParse({
        email: 'person@example.test',
        password: 'password',
        displayName: '  ',
      }).success,
    ).toBe(false);
  });
});
