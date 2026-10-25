import { z } from 'zod';

import { AppError } from '@/lib/server/api-errors';

export async function parseJsonBody<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema,
): Promise<z.output<TSchema>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError('VALIDATION', 'Request body must be valid JSON.');
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new AppError('VALIDATION', 'Request body failed validation.');
  }

  return result.data;
}

export function parseQueryParams<TSchema extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: TSchema,
): z.output<TSchema> {
  const result = schema.safeParse(Object.fromEntries(searchParams.entries()));

  if (!result.success) {
    throw new AppError('VALIDATION', 'Query parameters failed validation.');
  }

  return result.data;
}
