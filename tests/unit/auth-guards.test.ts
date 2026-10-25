import { describe, expect, it, vi } from 'vitest';

import {
  requireAuthenticatedUser,
  requireEventOwnership,
  requireRole,
} from '@/lib/server/auth/guards';

interface MockAuthOptions {
  userId?: string;
  role?: string;
  ownerId?: string;
  eventMissing?: boolean;
  authError?: { status: number } | null;
}

function createAuthClient({
  userId = 'user-a',
  role = 'organizer',
  ownerId = 'user-a',
  eventMissing = false,
  authError = null,
}: MockAuthOptions = {}) {
  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: authError ? null : { id: userId } },
      error: authError,
    }),
  };
  const from = vi.fn((table: string) => {
    const row =
      table === 'profiles'
        ? { data: { role }, error: null }
        : eventMissing
          ? { data: null, error: null }
          : { data: { organizer_id: ownerId }, error: null };

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue(row),
        })),
      })),
    };
  });

  return { auth, from } as never;
}

describe('server authorization guards', () => {
  it('rejects missing or invalid users', async () => {
    await expect(
      requireAuthenticatedUser(
        createAuthClient({ authError: { status: 401 } }),
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED', status: 401 });
  });

  it('rejects roles not permitted by a server-side check', async () => {
    await expect(
      requireRole(createAuthClient({ role: 'attendee' }), ['organizer']),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('allows an organizer to operate on their own event', async () => {
    await expect(
      requireEventOwnership(createAuthClient(), 'event-id'),
    ).resolves.toMatchObject({ user: { id: 'user-a' }, role: 'organizer' });
  });

  it('denies an organizer access to another organizer event', async () => {
    await expect(
      requireEventOwnership(
        createAuthClient({ ownerId: 'user-b' }),
        'event-id',
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('returns not found for a missing organizer event', async () => {
    await expect(
      requireEventOwnership(
        createAuthClient({ eventMissing: true }),
        'event-id',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
