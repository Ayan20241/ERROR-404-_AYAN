import { AppError } from '@/lib/server/api-errors';
import { eventIdSchema } from '@/lib/server/events/schemas';

export function parseEventId(id: string): string {
  if (!eventIdSchema.safeParse(id).success) {
    throw new AppError('VALIDATION', 'Event id is invalid.');
  }

  return id;
}

export function mapRegistrationOutcome(outcome: unknown): string {
  switch (outcome) {
    case 'registered':
    case 'cancelled':
    case 'already_cancelled':
      return outcome;
    case 'event_full':
      throw new AppError('EVENT_FULL', 'This event is full.');
    case 'deadline_passed':
      throw new AppError(
        'DEADLINE_PASSED',
        'The registration deadline has passed.',
      );
    case 'already_registered':
      throw new AppError('ALREADY_REGISTERED', 'You are already registered.');
    case 'own_event':
    case 'not_allowed':
    case 'forbidden':
      throw new AppError('FORBIDDEN', 'You do not have permission to do this.');
    case 'event_not_found':
    case 'event_unavailable':
      throw new AppError('NOT_FOUND', 'Event not found.');
    case 'unauthenticated':
      throw new AppError('UNAUTHORIZED', 'Authentication is required.');
    case 'not_registered':
      throw new AppError('NOT_FOUND', 'Registration not found.');
    default:
      throw new AppError(
        'INTERNAL',
        'The registration request could not be completed.',
      );
  }
}

export function mapOrganizerMutationOutcome(outcome: unknown): string {
  switch (outcome) {
    case 'promoted':
    case 'already_organizer':
    case 'updated':
    case 'cancelled':
      return outcome;
    case 'capacity_below_registrations':
      throw new AppError(
        'VALIDATION',
        'Capacity cannot be lower than the active registration count.',
      );
    case 'invalid_changes':
      throw new AppError('VALIDATION', 'Event changes are invalid.');
    case 'event_cancelled':
      throw new AppError('CONFLICT', 'A cancelled event cannot be updated.');
    case 'already_cancelled':
      throw new AppError('CONFLICT', 'The event is already cancelled.');
    case 'event_not_found':
      throw new AppError('NOT_FOUND', 'Event not found.');
    case 'forbidden':
    case 'not_allowed':
      throw new AppError('FORBIDDEN', 'You do not have permission to do this.');
    case 'unauthenticated':
      throw new AppError('UNAUTHORIZED', 'Authentication is required.');
    case 'profile_missing':
      throw new AppError('FORBIDDEN', 'Account permissions are unavailable.');
    default:
      throw new AppError('INTERNAL', 'The request could not be completed.');
  }
}
