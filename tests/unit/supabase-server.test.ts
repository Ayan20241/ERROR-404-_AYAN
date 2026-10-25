import { afterEach, describe, expect, it, vi } from 'vitest';

const { cookieStore, createServerClient } = vi.hoisted(() => ({
  cookieStore: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
  createServerClient: vi.fn((...args: unknown[]) => {
    void args;
    return {};
  }),
}));

vi.mock('server-only', () => ({}));
vi.mock('@supabase/ssr', () => ({ createServerClient }));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  if (originalUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  }
  if (originalAnonKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
  }
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe('Supabase server client', () => {
  it('uses public credentials and secure, HTTP-only cookie settings', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-public-key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    vi.stubEnv('NODE_ENV', 'production');

    await createSupabaseServerClient();

    expect(createServerClient).toHaveBeenCalledWith(
      'http://127.0.0.1:54321',
      'test-public-key',
      expect.objectContaining({
        cookieOptions: {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
        },
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
  });

  it('persists refreshed cookies through the framework cookie store', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-public-key';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

    await createSupabaseServerClient();
    const options = createServerClient.mock.calls[0]?.[2] as
      | {
          cookies: {
            getAll: () => unknown[];
            setAll: (
              cookies: { name: string; value: string; options: object }[],
            ) => void;
          };
        }
      | undefined;

    expect(options?.cookies.getAll()).toEqual([]);
    options?.cookies.setAll([
      {
        name: 'auth-cookie',
        value: 'test-session',
        options: { httpOnly: true },
      },
    ]);
    expect(cookieStore.set).toHaveBeenCalledWith(
      'auth-cookie',
      'test-session',
      { httpOnly: true },
    );
  });
});
