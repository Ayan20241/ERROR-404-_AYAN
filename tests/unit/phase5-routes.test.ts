import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseServerClient, supabase } = vi.hoisted(() => {
  const supabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    rpc: vi.fn(),
  };
  return {
    createSupabaseServerClient: vi.fn(async () => supabase),
    supabase,
  };
});

vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient }));

import { POST as saveEvent } from '@/app/api/events/[id]/save/route';
import { POST as submitFeedback } from '@/app/api/events/[id]/feedback/route';
import { GET as getAdminStats } from '@/app/api/admin/stats/route';
import { PATCH as markAttendance } from '@/app/api/organizer/events/[id]/attendance/route';
import { GET as getNotifications } from '@/app/api/notifications/route';

const origin = 'http://localhost:3000';
const eventId = 'c483d270-d9a8-4ae4-a695-c182ec7769ad';
const attendeeId = '5e02f96b-45b4-4d61-b8d8-47e660879413';

function setSession(role = 'attendee', eventOwner = 'user-a') {
  supabase.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-a' } },
    error: null,
  });
  supabase.from.mockImplementation((table: string) => {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      is: vi.fn(() => builder),
      order: vi.fn(() => builder),
      limit: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      update: vi.fn(() => builder),
      delete: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => ({
        data:
          table === 'profiles'
            ? { role }
            : table === 'events'
              ? { organizer_id: eventOwner }
              : null,
        error: null,
      })),
      single: vi.fn(async () => ({
        data: { id: 'feedback-1', rating: 5 },
        error: null,
      })),
      then: (resolve: (result: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    };
    return builder;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setSession();
});

describe('Phase 5 API authorization and data contracts', () => {
  it('saves an event through the idempotent database function', async () => {
    supabase.rpc.mockResolvedValue({ data: 'saved', error: null });
    const response = await saveEvent(
      new Request(`${origin}/api/events/${eventId}/save`, {
        method: 'POST',
        headers: { Origin: origin },
      }),
      { params: Promise.resolve({ id: eventId }) },
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('save_event', {
      p_event_id: eventId,
    });
  });

  it('sets feedback attendee identity from the authenticated session', async () => {
    const request = new Request(`${origin}/api/events/${eventId}/feedback`, {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await submitFeedback(request, {
      params: Promise.resolve({ id: eventId }),
    });

    expect(response.status).toBe(201);
    const feedbackTable = supabase.from.mock.results.at(-1)?.value;
    expect(feedbackTable.insert).toHaveBeenCalledWith({
      event_id: eventId,
      attendee_id: 'user-a',
      rating: 5,
      comment: null,
    });
  });

  it('marks attendance through the database authorization function', async () => {
    setSession('organizer', 'user-a');
    supabase.rpc.mockResolvedValue({ data: 'attendance_updated', error: null });
    const response = await markAttendance(
      new Request(`${origin}/api/organizer/events/${eventId}/attendance`, {
        method: 'PATCH',
        headers: {
          Origin: origin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeId,
          attendanceStatus: 'attended',
        }),
      }),
      { params: Promise.resolve({ id: eventId }) },
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith('mark_event_attendance', {
      p_event_id: eventId,
      p_attendee_id: attendeeId,
      p_attendance: 'attended',
    });
  });

  it('limits notification listing to the current recipient', async () => {
    const response = await getNotifications(
      new Request(`${origin}/api/notifications?unread=true`),
    );

    expect(response.status).toBe(200);
    const notificationQuery = supabase.from.mock.results.at(-1)?.value;
    expect(notificationQuery.eq).toHaveBeenCalledWith('recipient_id', 'user-a');
    expect(notificationQuery.is).toHaveBeenCalledWith('read_at', null);
  });

  it('denies platform statistics to non-admins before calling the aggregate', async () => {
    const response = await getAdminStats();

    expect(response.status).toBe(403);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
