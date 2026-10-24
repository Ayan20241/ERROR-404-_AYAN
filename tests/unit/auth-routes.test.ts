import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServerClient, supabase } = vi.hoisted(() => {
  const supabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
    from: vi.fn(),
  };

  return {
    createSupabaseServerClient: vi.fn(async () => supabase),
    supabase,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient }));

import { POST as signUp } from '@/app/api/auth/signup/route';
import { POST as signIn } from '@/app/api/auth/signin/route';
import { POST as signOut } from '@/app/api/auth/signout/route';
import { GET as getSession } from '@/app/api/auth/session/route';
import { GET as authCallback } from '@/app/api/auth/callback/route';

const origin = 'http://localhost:3000';
const originalAuthUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAuthAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

function jsonRequest(
  path: string,
  body: unknown,
  includeOrigin = true,
): Request {
  return new Request(`${origin}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(includeOrigin ? { Origin: origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-public-key';
  process.env.NEXT_PUBLIC_APP_URL = origin;
});

afterAll(() => {
  if (originalAuthUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalAuthUrl;
  }
  if (originalAuthAnonKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAuthAnonKey;
  }
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe('authentication routes (mocked Supabase)', () => {
  it('rejects cross-origin sign-up before calling Supabase', async () => {
    const response = await signUp(
      jsonRequest(
        '/api/auth/signup',
        { email: 'person@example.com', password: 'secret' },
        false,
      ),
    );

    expect(response.status).toBe(403);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('rejects role escalation fields in sign-up', async () => {
    const response = await signUp(
      jsonRequest('/api/auth/signup', {
        email: 'person@example.com',
        password: 'secret',
        role: 'admin',
      }),
    );

    expect(response.status).toBe(400);
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('creates an account without trusting role or returning tokens', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'person@example.com' },
        session: null,
      },
      error: null,
    });

    const response = await signUp(
      jsonRequest('/api/auth/signup', {
        email: 'person@example.com',
        password: 'secret',
        displayName: 'Person',
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: { id: 'user-id', email: 'person@example.com' },
      authenticated: false,
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secret',
      options: {
        emailRedirectTo: 'http://localhost:3000/api/auth/callback',
        data: { display_name: 'Person' },
      },
    });
  });

  it('returns a generic unauthorized sign-in error without provider details', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 400, message: 'email enumeration details' },
    });

    const response = await signIn(
      jsonRequest('/api/auth/signin', {
        email: 'person@example.com',
        password: 'wrong',
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed.' },
    });
  });

  it('returns only safe user fields after sign-in', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'person@example.com' },
        session: {
          access_token: 'private-access-token',
          refresh_token: 'private-refresh-token',
        },
      },
      error: null,
    });

    const response = await signIn(
      jsonRequest('/api/auth/signin', {
        email: 'person@example.com',
        password: 'secret',
      }),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe(
      JSON.stringify({
        user: { id: 'user-id', email: 'person@example.com' },
      }),
    );
    expect(body).not.toContain('private-access-token');
    expect(body).not.toContain('private-refresh-token');
  });

  it('signs out through the server client', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    const response = await signOut(jsonRequest('/api/auth/signout', {}));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ signedOut: true });
  });

  it('returns no user for an expired session', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { status: 401 },
    });

    const response = await getSession();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: null,
      role: null,
    });
  });

  it('returns a validated role for an authenticated session', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-id', email: 'person@example.com' } },
      error: null,
    });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { role: 'organizer' },
            error: null,
          }),
        }),
      }),
    });

    const response = await getSession();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: { id: 'user-id', email: 'person@example.com' },
      role: 'organizer',
    });
  });

  it('exchanges confirmation codes and redirects only to a local path', async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await authCallback(
      new Request(
        `${origin}/api/auth/callback?code=one-time-code&next=%2Faccount`,
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe(`${origin}/account`);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      'one-time-code',
    );
  });

  it('rejects an external callback redirect target', async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await authCallback(
      new Request(
        `${origin}/api/auth/callback?code=one-time-code&next=https%3A%2F%2Fevil.example`,
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe(`${origin}/`);
  });
});
