import type { SupabaseClient, User } from '@supabase/supabase-js';

import { AppError } from '@/lib/server/api-errors';

export const USER_ROLES = ['attendee', 'organizer', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    USER_ROLES.some((permittedRole) => permittedRole === value)
  );
}

type AuthClient = SupabaseClient;

export interface AuthenticatedContext {
  user: User;
  role: UserRole;
}

export async function requireAuthenticatedUser(
  supabase: AuthClient,
): Promise<AuthenticatedContext> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? error.status
        : null;

    if (status === 401 || status === 400) {
      throw new AppError('UNAUTHORIZED', 'Authentication is required.');
    }

    throw new AppError('INTERNAL', 'Unable to verify authentication.');
  }

  if (!data.user) {
    throw new AppError('UNAUTHORIZED', 'Authentication is required.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new AppError('INTERNAL', 'Unable to verify account permissions.');
  }

  if (!profile || !isUserRole(profile.role)) {
    throw new AppError('FORBIDDEN', 'Account permissions are unavailable.');
  }

  return { user: data.user, role: profile.role };
}

export async function requireRole(
  supabase: AuthClient,
  permittedRoles: readonly UserRole[],
): Promise<AuthenticatedContext> {
  const context = await requireAuthenticatedUser(supabase);

  if (!permittedRoles.includes(context.role)) {
    throw new AppError('FORBIDDEN', 'You do not have permission to do this.');
  }

  return context;
}

export async function requireEventOwnership(
  supabase: AuthClient,
  eventId: string,
): Promise<AuthenticatedContext> {
  const context = await requireRole(supabase, ['organizer', 'admin']);

  if (context.role === 'admin') {
    return context;
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    throw new AppError('INTERNAL', 'Unable to verify event ownership.');
  }

  if (!event) {
    throw new AppError('NOT_FOUND', 'Event not found.');
  }

  if (event.organizer_id !== context.user.id) {
    throw new AppError('FORBIDDEN', 'You do not own this event.');
  }

  return context;
}
