import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/server/api-errors';
import {
  eventSearchQueryFieldsSchema,
  eventSearchQuerySchema,
} from '@/lib/server/events/search-schema';
import {
  parseJsonBody,
  parseQueryParams,
} from '@/lib/server/request-validation';

describe('request validation', () => {
  it('applies the documented event query pagination defaults', () => {
    expect(
      parseQueryParams(new URLSearchParams(), eventSearchQuerySchema),
    ).toMatchObject({ page: 1, pageSize: 12 });
  });

  it('rejects out-of-range query values', () => {
    expect(() =>
      parseQueryParams(
        new URLSearchParams('lat=91&pageSize=49'),
        eventSearchQuerySchema,
      ),
    ).toThrowError(AppError);
  });

  it('strips unknown query parameters', () => {
    const result = parseQueryParams(
      new URLSearchParams('page=2&unexpected=value'),
      eventSearchQuerySchema,
    );

    expect(result).toMatchObject({ page: 2, pageSize: 12 });
    expect(result).not.toHaveProperty('unexpected');
  });

  it('validates JSON request bodies and returns parsed data', async () => {
    const request = new Request('http://localhost/api/example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: ' event ' }),
    });

    await expect(
      parseJsonBody(request, eventSearchQueryFieldsSchema.pick({ q: true })),
    ).resolves.toEqual({ q: 'event' });
  });

  it('maps malformed JSON to a validation error', async () => {
    const request = new Request('http://localhost/api/example', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });

    await expect(
      parseJsonBody(request, eventSearchQuerySchema),
    ).rejects.toMatchObject({ code: 'VALIDATION', status: 400 });
  });
});
