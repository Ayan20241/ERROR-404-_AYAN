import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError, createApiErrorResponse } from '@/lib/server/api-errors';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createApiErrorResponse', () => {
  it('preserves typed error codes and their status', async () => {
    const response = createApiErrorResponse(
      new AppError('NOT_FOUND', 'Event not found.'),
      '/api/events/example',
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: 'Event not found.' },
    });
  });

  it('hides unexpected error details and logs only a request reference', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = createApiErrorResponse(
      new Error('database password must not leak'),
      '/api/events',
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('database password');
    expect(body).toEqual({
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred.',
      },
    });
    expect(log).toHaveBeenCalledWith(
      'Unhandled API error',
      expect.objectContaining({ route: '/api/events' }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('database password');
  });
});
