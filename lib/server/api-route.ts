import { AppError, createApiErrorResponse } from '@/lib/server/api-errors';

export async function runApiRoute(
  route: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    const response = await handler();
    const headers = new Headers(response.headers);
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'no-store');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    return createApiErrorResponse(error, route);
  }
}

export function mapSupabaseError(
  error: { code?: string } | null,
  message: string,
): never {
  if (error?.code === '42501') {
    throw new AppError('FORBIDDEN', 'You do not have permission to do this.');
  }

  if (error?.code === '23505') {
    throw new AppError('CONFLICT', message);
  }

  if (error?.code === '23514' || error?.code === '22003') {
    throw new AppError('VALIDATION', message);
  }
  if (
    error?.code === '23502' ||
    error?.code === '22P02' ||
    error?.code === '22007'
  ) {
    throw new AppError('VALIDATION', message);
  }

  throw new AppError(
    'INTERNAL',
    'The database request could not be completed.',
  );
}
