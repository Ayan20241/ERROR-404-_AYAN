import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import {
  assertValidIndiaLocation,
  listIndiaCities,
} from '@/lib/server/locations/service';

function createSupabaseMock(cityValid: boolean) {
  const calls: Array<{ table: string; filters: unknown[][] }> = [];
  const supabase = {
    from(table: string) {
      const call = { table, filters: [] as unknown[][] };
      calls.push(call);
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn((column: string, value: string) => {
          call.filters.push([column, value]);
          return builder;
        }),
        order: vi.fn(() => builder),
        maybeSingle: vi.fn(async () => ({
          data:
            table === 'india_admin_divisions'
              ? { code: 'IN-KA' }
              : cityValid
                ? { id: 'IN-KA-BENGALURU' }
                : null,
          error: null,
        })),
        then: (
          resolve: (value: {
            data: Array<{
              id: string;
              name: string;
              division_code: string;
              country_code: 'IN';
            }>;
            error: null;
          }) => unknown,
        ) =>
          Promise.resolve({
            data: [
              {
                id: 'IN-KA-BENGALURU',
                name: 'Bengaluru',
                division_code: 'IN-KA',
                country_code: 'IN' as const,
              },
            ],
            error: null,
          }).then(resolve),
      };
      return builder;
    },
  };
  return { supabase: supabase as unknown as SupabaseClient, calls };
}

describe('server-side Indian location validation', () => {
  it('queries cities under the selected state rather than matching by city name', async () => {
    const { supabase, calls } = createSupabaseMock(true);
    const result = await listIndiaCities(supabase, 'IN-KA');

    expect(result).toMatchObject([
      { id: 'IN-KA-BENGALURU', division_code: 'IN-KA' },
    ]);
    expect(calls[1].filters).toContainEqual(['division_code', 'IN-KA']);
  });

  it('rejects a city that is not a member of the selected state or territory', async () => {
    const { supabase } = createSupabaseMock(false);

    await expect(
      assertValidIndiaLocation(supabase, 'IN-KA', 'IN-TR-UDAIPUR'),
    ).rejects.toMatchObject({
      code: 'VALIDATION',
      message: 'The selected city does not belong to that state or territory.',
    });
  });
});
