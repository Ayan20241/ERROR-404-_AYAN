import { describe, expect, it } from 'vitest';

import {
  EnvironmentConfigurationError,
  parseServerEnvironment,
  parseSupabasePublicEnvironment,
} from '@/lib/env/schema';

const validEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

describe('parseServerEnvironment', () => {
  it('applies the documented default map style', () => {
    const environment = parseServerEnvironment(validEnvironment);

    expect(environment.NEXT_PUBLIC_MAP_STYLE_URL).toBe(
      'https://tiles.openfreemap.org/styles/liberty',
    );
  });

  it('accepts a Supabase publishable key as the public client key', () => {
    const parsed = parseServerEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: validEnvironment.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_APP_URL: validEnvironment.NEXT_PUBLIC_APP_URL,
      SUPABASE_SERVICE_ROLE_KEY: validEnvironment.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    });

    expect(parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(
      'test-publishable-key',
    );
  });

  describe('parseSupabasePublicEnvironment', () => {
    it('requires only the public Supabase values and does not expose values', () => {
      expect(() => parseSupabasePublicEnvironment({})).toThrow(
        EnvironmentConfigurationError,
      );
      let error: unknown;
      try {
        parseSupabasePublicEnvironment({
          NEXT_PUBLIC_SUPABASE_URL: 'invalid',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-value',
          NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        });
      } catch (caught) {
        error = caught;
      }

      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect(String(error)).toContain('NEXT_PUBLIC_SUPABASE_URL');
      expect(String(error)).not.toContain('test-public-value');
    });

    it('normalizes a publishable key for existing Supabase client setup', () => {
      const environment = parseSupabasePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      });

      expect(environment.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(
        'test-publishable-key',
      );
    });
  });

  it('reports invalid variable names without including their values', () => {
    const secret = 'do-not-include-this-secret';

    try {
      parseServerEnvironment({
        ...validEnvironment,
        SUPABASE_SERVICE_ROLE_KEY: '',
        NEXT_PUBLIC_APP_URL: 'not-a-url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: secret,
      });
      throw new Error('Expected environment parsing to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect(String(error)).not.toContain(secret);
      expect(String(error)).toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(String(error)).toContain('NEXT_PUBLIC_APP_URL');
    }
  });
});
