import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { proxy } from '@/proxy';

const environmentNames = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_MAP_STYLE_URL',
] as const;

const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, process.env[name]]),
);

afterEach(() => {
  for (const name of environmentNames) {
    const value = originalEnvironment[name];
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe('proxy environment validation', () => {
  it('returns a safe configuration response without exposing environment values', async () => {
    const secretLikeUrl = 'not-a-valid-supabase-url';
    const secretLikeKey = 'do-not-return-this-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = secretLikeUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = secretLikeKey;
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    delete process.env.NEXT_PUBLIC_MAP_STYLE_URL;

    const response = await proxy(new NextRequest('http://localhost:3000/'));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body.error.code).toBe('CONFIGURATION');
    expect(body.error.variables).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(body.error.variables).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(JSON.stringify(body)).not.toContain(secretLikeUrl);
    expect(JSON.stringify(body)).not.toContain(secretLikeKey);
  });
});
