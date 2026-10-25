import { z } from 'zod';

const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const httpUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => value.startsWith('http://') || value.startsWith('https://'),
  );

export const supabasePublicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: httpUrlSchema,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: httpUrlSchema,
});

export const serverEnvironmentSchema = supabasePublicEnvironmentSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_MAP_STYLE_URL: httpUrlSchema.default(DEFAULT_MAP_STYLE_URL),
});

export type ServerEnvironment = z.output<typeof serverEnvironmentSchema>;
export type SupabasePublicEnvironment = z.output<
  typeof supabasePublicEnvironmentSchema
>;

export class EnvironmentConfigurationError extends Error {
  readonly invalidVariables: string[];

  constructor(invalidVariables: string[]) {
    const names = [...new Set(invalidVariables)].sort();
    super(`Invalid environment configuration: ${names.join(', ')}`);
    this.name = 'EnvironmentConfigurationError';
    this.invalidVariables = names;
  }
}

export function parseServerEnvironment(
  input: Record<string, string | undefined>,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(input);

  if (!result.success) {
    throw new EnvironmentConfigurationError(
      result.error.issues.map((issue) => issue.path.join('.')),
    );
  }

  return result.data;
}

export function parseSupabasePublicEnvironment(
  input: Record<string, string | undefined>,
): SupabasePublicEnvironment {
  const result = supabasePublicEnvironmentSchema.safeParse(input);

  if (!result.success) {
    throw new EnvironmentConfigurationError(
      result.error.issues.map((issue) => issue.path.join('.')),
    );
  }

  return result.data;
}
