export const API_ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION',
  'EVENT_FULL',
  'DEADLINE_PASSED',
  'ALREADY_REGISTERED',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 400,
  EVENT_FULL: 409,
  DEADLINE_PASSED: 409,
  ALREADY_REGISTERED: 409,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
  }
}

export function createApiErrorResponse(
  error: unknown,
  route: string,
): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      {
        status: error.status,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  const requestId = crypto.randomUUID();
  console.error('Unhandled API error', { route, requestId });

  return Response.json(
    {
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred.',
      },
    },
    {
      status: STATUS_BY_CODE.INTERNAL,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
