import { AppError, createApiErrorResponse } from '@/lib/server/api-errors';

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');

  if (!origin || origin !== new URL(request.url).origin) {
    throw new AppError('FORBIDDEN', 'Cross-origin requests are not allowed.');
  }
}

export async function runAuthRoute(
  route: string,
  handler: () => Promise<unknown>,
): Promise<Response> {
  try {
    return Response.json(await handler(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return createApiErrorResponse(error, route);
  }
}

export function authFailure(
  error: { status?: number | null } | null,
  operation: 'signUp' | 'signIn',
): never {
  if (error?.status === 429) {
    throw new AppError('RATE_LIMITED', 'Too many authentication attempts.');
  }

  if (operation === 'signUp' && error?.status === 400) {
    throw new AppError('VALIDATION', 'Unable to create an account.');
  }

  if (operation === 'signIn' && [400, 401].includes(error?.status ?? 0)) {
    throw new AppError('UNAUTHORIZED', 'Authentication failed.');
  }

  throw new AppError('INTERNAL', 'Authentication service is unavailable.');
}
