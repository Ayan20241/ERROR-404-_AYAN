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

import { GET as listEvents } from '@/app/api/events/route';
import { GET as listRegistrations } from '@/app/api/me/registrations/route';
import {
  DELETE as cancelRegistration,
  POST as registerForEvent,
} from '@/app/api/events/[id]/register/route';
import { PATCH as updateEvent } from '@/app/api/organizer/events/[id]/route';
import { PATCH as updateProfile } from '@/app/api/me/profile/route';

const origin = 'http://localhost:3000';
const eventId = 'c483d270-d9a8-4ae4-a695-c182ec7769ad';

function setAuthClient(
  role = 'attendee',
  ownerId = 'user-a',
  registrations: unknown[] = [],
) {
  supabase.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-a' } },
    error: null,
  });
  supabase.from.mockImplementation((table: string) => {
    const row =
      table === 'profiles'
        ? { role }
        : { organizer_id: ownerId, id: eventId, status: 'draft' };
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      order: vi.fn(() => builder),
      then: undefined,
      maybeSingle: vi.fn(async () => ({ data: row, error: null })),
    };
    Object.assign(builder, {
      then: (resolve: (result: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({
          data: table === 'registrations' ? registrations : [],
          error: null,
        }).then(resolve),
    });
    return builder;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setAuthClient();
});

describe('core API route contracts', () => {
  it('returns only the authenticated attendee registrations with safe event fields', async () => {
    const rows = [
      {
        id: 'registration-1',
        event_id: eventId,
        status: 'registered',
        attendance_status: 'unknown',
        registered_at: '2026-01-01T12:00:00Z',
        event: {
          id: eventId,
          title: 'Community meetup',
          start_at: '2026-02-01T12:00:00Z',
          status: 'published',
        },
      },
    ];
    setAuthClient('attendee', 'user-a', rows);

    const response = await listRegistrations();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      registrations: rows,
    });
    expect(supabase.from).toHaveBeenCalledWith('registrations');
    const query = supabase.from.mock.results.at(-1)?.value;
    expect(query.eq).toHaveBeenCalledWith('attendee_id', 'user-a');
    expect(query.select).toHaveBeenCalledWith(
      'id, event_id, status, attendance_status, registered_at, event:events(id, title, category, start_at, end_at, venue_name, address, image_url, price, currency, status, country_code, city_id, locality)',
    );
    expect(query.select.mock.calls[0][0]).not.toContain('email');
  });

  it('denies registration history to non-attendees', async () => {
    setAuthClient('organizer');

    const response = await listRegistrations();

    expect(response.status).toBe(403);
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('executes public search through the SQL-paginated RPC', async () => {
    supabase.rpc.mockResolvedValue({
      data: { events: [], total: 0 },
      error: null,
    });

    const response = await listEvents(
      new Request(`${origin}/api/events?q=music&page=2&pageSize=5`),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ events: [], total: 0 });
    expect(supabase.rpc).toHaveBeenCalledWith(
      'search_public_events_by_location',
      {
        p_query: 'music',
        p_category: null,
        p_date_from: null,
        p_date_to: null,
        p_max_price: null,
        p_latitude: null,
        p_longitude: null,
        p_radius_km: null,
        p_page: 2,
        p_page_size: 5,
        p_state_code: null,
        p_city_id: null,
        p_locality: null,
      },
    );
  });

  it('passes selected state and city filters to server-side SQL search', async () => {
    supabase.rpc.mockResolvedValue({
      data: { events: [], total: 0 },
      error: null,
    });
    const response = await listEvents(
      new Request(
        `${origin}/api/events?stateCode=IN-KA&cityId=IN-KA-BENGALURU`,
      ),
    );

    expect(response.status).toBe(200);
    expect(supabase.rpc).toHaveBeenCalledWith(
      'search_public_events_by_location',
      expect.objectContaining({
        p_state_code: 'IN-KA',
        p_city_id: 'IN-KA-BENGALURU',
        p_locality: null,
      }),
    );
  });

  it('rejects profile role escalation before touching Supabase', async () => {
    const request = new Request(`${origin}/api/me/profile`, {
      method: 'PATCH',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'admin' }),
    });

    const response = await updateProfile(request);

    expect(response.status).toBe(400);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('maps the atomic database full-seat outcome to the documented response', async () => {
    setAuthClient('attendee');
    supabase.rpc.mockResolvedValue({ data: 'event_full', error: null });
    const request = new Request(`${origin}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { Origin: origin },
    });

    const response = await registerForEvent(request, {
      params: Promise.resolve({ id: eventId }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'EVENT_FULL' },
    });
  });

  it('treats an already-cancelled registration as an idempotent success', async () => {
    supabase.rpc.mockResolvedValue({ data: 'already_cancelled', error: null });
    const request = new Request(`${origin}/api/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { Origin: origin },
    });

    const response = await cancelRegistration(request, {
      params: Promise.resolve({ id: eventId }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      registration: { event_id: eventId, status: 'cancelled' },
      result: 'already_cancelled',
    });
  });

  it('blocks organizer edits to another organizer event before the RPC', async () => {
    setAuthClient('organizer', 'user-b');
    const request = new Request(`${origin}/api/organizer/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Unauthorized change' }),
    });

    const response = await updateEvent(request, {
      params: Promise.resolve({ id: eventId }),
    });

    expect(response.status).toBe(403);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
