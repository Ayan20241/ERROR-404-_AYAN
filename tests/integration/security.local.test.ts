import { randomUUID } from 'node:crypto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface LocalConfiguration {
  url: string;
  databaseUrl: string;
  projectId: string;
  anonKey: string;
  serviceRoleKey: string;
}

function isLoopback(hostname: string): boolean {
  return ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(hostname);
}

function loadLocalConfiguration(): LocalConfiguration | null {
  const url = process.env.SUPABASE_TEST_URL;
  const databaseUrl = process.env.SUPABASE_TEST_DATABASE_URL;
  const projectId = process.env.SUPABASE_TEST_PROJECT_ID;
  const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;

  if (!url && !databaseUrl && !projectId && !anonKey && !serviceRoleKey) {
    return null;
  }

  if (!url || !databaseUrl || !projectId || !anonKey || !serviceRoleKey) {
    throw new Error('All SUPABASE_TEST_* variables are required together.');
  }

  const apiUrl = new URL(url);
  const dbUrl = new URL(databaseUrl);

  if (
    projectId !== 'hyperlocal-events' ||
    apiUrl.protocol !== 'http:' ||
    !isLoopback(apiUrl.hostname) ||
    apiUrl.port !== '54321' ||
    !['postgres:', 'postgresql:'].includes(dbUrl.protocol) ||
    !isLoopback(dbUrl.hostname) ||
    dbUrl.port !== '54322'
  ) {
    throw new Error(
      'Security integration tests require project hyperlocal-events with loopback API and database ports 54321 and 54322.',
    );
  }

  return { url, databaseUrl, projectId, anonKey, serviceRoleKey };
}

const configuration = loadLocalConfiguration();
const describeLocal = configuration ? describe : describe.skip;
const testRunId = randomUUID();
const password = `Integration-${randomUUID()}-Aa1!`;
const createdUserIds: string[] = [];
const createdEventIds: string[] = [];

let serviceClient: SupabaseClient;
let attendeeA: SupabaseClient;
let attendeeB: SupabaseClient;
let organizerA: SupabaseClient;
let organizerB: SupabaseClient;
let adminUser: SupabaseClient;
let attendeeAId: string;
let attendeeBId: string;
let organizerAId: string;
let organizerBId: string;
let publishedEventId: string;
let foreignEventId: string;
let cancelledEventId: string;
let expiredEventId: string;
let endedEventId: string;
let draftEventId: string;

function createUserClient(): SupabaseClient {
  if (!configuration) {
    throw new Error('Local Supabase configuration is unavailable.');
  }

  return createClient(configuration.url, configuration.anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function createAuthUser(
  role: 'attendee' | 'organizer' | 'admin',
  suffix: string,
): Promise<{ client: SupabaseClient; id: string }> {
  if (!configuration) {
    throw new Error('Local Supabase configuration is unavailable.');
  }

  const email = `phase23-${testRunId}-${suffix}@example.test`;
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: `${suffix} test user` },
  });

  if (error || !data.user) {
    throw new Error('Unable to create an isolated local test user.');
  }

  createdUserIds.push(data.user.id);
  const { error: roleError } = await serviceClient
    .from('profiles')
    .update({ role })
    .eq('id', data.user.id);

  if (roleError) {
    throw new Error('Unable to assign a role to an isolated local test user.');
  }

  const client = createUserClient();
  const { error: signInError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error('Unable to sign in an isolated local test user.');
  }

  return { client, id: data.user.id };
}

async function createEvent({
  organizerId,
  status,
  capacity = 2,
  registrationDeadline,
  startsAt,
  endsAt,
}: {
  organizerId: string;
  status: 'draft' | 'published' | 'cancelled';
  capacity?: number;
  registrationDeadline?: string | null;
  startsAt: Date;
  endsAt: Date;
}): Promise<string> {
  const { data, error } = await serviceClient
    .from('events')
    .insert({
      organizer_id: organizerId,
      title: `Isolated test event ${testRunId}`,
      description: 'Temporary database security test event.',
      category: 'Technology',
      start_at: startsAt.toISOString(),
      end_at: endsAt.toISOString(),
      capacity,
      registered_count: 0,
      status,
      registration_deadline: registrationDeadline ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Unable to create an isolated local test event.');
  }

  createdEventIds.push(data.id);
  return data.id;
}

async function rpc(client: SupabaseClient, functionName: string, args: object) {
  const { data, error } = await client.rpc(functionName, args);
  if (error) {
    throw new Error(`Local test RPC failed: ${functionName}`);
  }
  return data;
}

describeLocal('local Supabase security integration', () => {
  beforeAll(async () => {
    if (!configuration) return;

    serviceClient = createClient(
      configuration.url,
      configuration.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );

    const a = await createAuthUser('attendee', 'attendee-a');
    const b = await createAuthUser('attendee', 'attendee-b');
    const ownerA = await createAuthUser('organizer', 'organizer-a');
    const ownerB = await createAuthUser('organizer', 'organizer-b');
    const admin = await createAuthUser('admin', 'admin');
    attendeeA = a.client;
    attendeeAId = a.id;
    attendeeB = b.client;
    attendeeBId = b.id;
    organizerA = ownerA.client;
    organizerAId = ownerA.id;
    organizerB = ownerB.client;
    organizerBId = ownerB.id;
    adminUser = admin.client;

    const now = Date.now();
    const futureStart = new Date(now + 86_400_000);
    const futureEnd = new Date(now + 172_800_000);
    const pastStart = new Date(now - 172_800_000);
    const pastEnd = new Date(now - 86_400_000);

    publishedEventId = await createEvent({
      organizerId: organizerAId,
      status: 'published',
      capacity: 1,
      startsAt: futureStart,
      endsAt: futureEnd,
    });
    foreignEventId = await createEvent({
      organizerId: organizerBId,
      status: 'published',
      startsAt: futureStart,
      endsAt: futureEnd,
    });
    cancelledEventId = await createEvent({
      organizerId: organizerAId,
      status: 'cancelled',
      startsAt: futureStart,
      endsAt: futureEnd,
    });
    expiredEventId = await createEvent({
      organizerId: organizerAId,
      status: 'published',
      registrationDeadline: new Date(now - 1000).toISOString(),
      startsAt: futureStart,
      endsAt: futureEnd,
    });
    endedEventId = await createEvent({
      organizerId: organizerAId,
      status: 'published',
      startsAt: pastStart,
      endsAt: pastEnd,
    });
    draftEventId = await createEvent({
      organizerId: organizerAId,
      status: 'draft',
      startsAt: futureStart,
      endsAt: futureEnd,
    });
  }, 30_000);

  afterAll(async () => {
    if (!configuration || !serviceClient) return;

    const cleanupFailures: string[] = [];

    if (createdEventIds.length > 0) {
      const { error } = await serviceClient
        .from('events')
        .delete()
        .in('id', createdEventIds);
      if (error) {
        cleanupFailures.push('events');
      }
    }

    for (const userId of createdUserIds) {
      const { error } = await serviceClient.auth.admin.deleteUser(userId);
      if (error) {
        cleanupFailures.push('users');
      }
    }

    if (cleanupFailures.length > 0) {
      throw new Error(
        `Unable to clean up isolated local test data (${[...new Set(cleanupFailures)].join(', ')}).`,
      );
    }
  }, 30_000);

  it('enforces public visibility, cross-user isolation, roles, and ownership', async () => {
    const { data: publicEvents, error: publicError } = await createClient(
      configuration!.url,
      configuration!.anonKey,
    )
      .from('events')
      .select('id')
      .in('id', [publishedEventId, draftEventId]);
    expect(publicError).toBeNull();
    expect(publicEvents?.map((event) => event.id)).toEqual([publishedEventId]);

    expect(
      await rpc(attendeeA, 'register_for_event', {
        p_event_id: foreignEventId,
      }),
    ).toBe('registered');
    const { error: saveError } = await attendeeA.from('saved_events').insert({
      attendee_id: attendeeAId,
      event_id: publishedEventId,
    });
    expect(saveError).toBeNull();
    const { error: notificationError } = await serviceClient
      .from('notifications')
      .insert({
        recipient_id: attendeeAId,
        event_id: publishedEventId,
        type: 'general',
        title: 'Isolated test notification',
        message: `Temporary ${testRunId}`,
      });
    expect(notificationError).toBeNull();

    const { data: profiles } = await attendeeB
      .from('profiles')
      .select('id')
      .in('id', [attendeeAId, attendeeBId]);
    expect(profiles?.map((profile) => profile.id)).toEqual([attendeeBId]);

    const { data: registrations } = await attendeeB
      .from('registrations')
      .select('id')
      .eq('event_id', foreignEventId);
    expect(registrations).toEqual([]);

    const { data: savedEvents } = await attendeeB
      .from('saved_events')
      .select('id')
      .eq('attendee_id', attendeeAId);
    expect(savedEvents).toEqual([]);

    const { data: notifications } = await attendeeB
      .from('notifications')
      .select('id')
      .eq('recipient_id', attendeeAId);
    expect(notifications).toEqual([]);

    const { error: roleEscalationError } = await attendeeB
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', attendeeBId);
    expect(roleEscalationError).not.toBeNull();

    const { data: updatedForeignEvent, error: ownershipError } =
      await organizerA
        .from('events')
        .update({ title: 'Unauthorized update' })
        .eq('id', foreignEventId)
        .select('id');
    expect(ownershipError).toBeNull();
    expect(updatedForeignEvent).toEqual([]);

    const { data: anonymousDraft } = await createClient(
      configuration!.url,
      configuration!.anonKey,
    )
      .from('events')
      .select('id')
      .eq('id', draftEventId);
    expect(anonymousDraft).toEqual([]);
  });

  it('preserves registration capacity, cancellation history, and re-registration', async () => {
    const [resultA, resultB] = await Promise.all([
      rpc(attendeeA, 'register_for_event', { p_event_id: publishedEventId }),
      rpc(attendeeB, 'register_for_event', { p_event_id: publishedEventId }),
    ]);
    expect([resultA, resultB].sort()).toEqual(['event_full', 'registered']);

    const winner = resultA === 'registered' ? attendeeA : attendeeB;
    const loser = winner === attendeeA ? attendeeB : attendeeA;
    expect(
      await rpc(winner, 'register_for_event', { p_event_id: publishedEventId }),
    ).toBe('already_registered');
    expect(
      await rpc(loser, 'register_for_event', { p_event_id: cancelledEventId }),
    ).toBe('event_unavailable');
    expect(
      await rpc(loser, 'register_for_event', { p_event_id: expiredEventId }),
    ).toBe('deadline_passed');
    expect(
      await rpc(winner, 'cancel_event_registration', {
        p_event_id: publishedEventId,
      }),
    ).toBe('cancelled');
    expect(
      await rpc(winner, 'cancel_event_registration', {
        p_event_id: publishedEventId,
      }),
    ).toBe('already_cancelled');
    expect(
      await rpc(winner, 'register_for_event', { p_event_id: publishedEventId }),
    ).toBe('registered');

    const { data: event } = await serviceClient
      .from('events')
      .select('registered_count')
      .eq('id', publishedEventId)
      .single();
    const { count: activeCount } = await serviceClient
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', publishedEventId)
      .eq('status', 'registered');
    expect(event?.registered_count).toBe(1);
    expect(activeCount).toBe(1);
  });

  it('paginates public search and secures organizer mutations and role promotion', async () => {
    const anonymous = createClient(configuration!.url, configuration!.anonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const { data: search, error: searchError } = await anonymous.rpc(
      'search_public_events',
      {
        p_query: `Isolated test event ${testRunId}`,
        p_category: 'Technology',
        p_date_from: null,
        p_date_to: null,
        p_max_price: null,
        p_latitude: null,
        p_longitude: null,
        p_radius_km: null,
        p_page: 1,
        p_page_size: 1,
      },
    );
    expect(searchError).toBeNull();
    expect(search).toMatchObject({ total: 3 });
    expect((search as { events: unknown[] }).events).toHaveLength(1);

    expect(
      await rpc(organizerB, 'update_owned_event', {
        p_event_id: publishedEventId,
        p_changes: { title: 'Unauthorized test update' },
      }),
    ).toBe('forbidden');
    expect(
      await rpc(organizerA, 'update_owned_event', {
        p_event_id: publishedEventId,
        p_changes: { capacity: 0 },
      }),
    ).toBe('capacity_below_registrations');
    expect(
      await rpc(organizerA, 'update_owned_event', {
        p_event_id: publishedEventId,
        p_changes: { title: 'Updated isolated event' },
      }),
    ).toBe('updated');

    const { count: updateNotificationCount } = await serviceClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', publishedEventId)
      .eq('type', 'event_updated');
    expect(updateNotificationCount).toBe(1);

    expect(
      await rpc(organizerA, 'cancel_owned_event', {
        p_event_id: publishedEventId,
      }),
    ).toBe('cancelled');
    expect(
      await rpc(organizerA, 'cancel_owned_event', {
        p_event_id: publishedEventId,
      }),
    ).toBe('already_cancelled');
    const { count: cancellationNotificationCount } = await serviceClient
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', publishedEventId)
      .eq('type', 'event_cancelled');
    expect(cancellationNotificationCount).toBe(1);

    expect(await rpc(attendeeB, 'become_organizer', {})).toBe('promoted');
    expect(await rpc(attendeeB, 'become_organizer', {})).toBe(
      'already_organizer',
    );
    expect(await rpc(adminUser, 'become_organizer', {})).toBe('not_allowed');
  });

  it('restricts attendance and feedback to eligible event attendees', async () => {
    expect(
      await rpc(attendeeA, 'register_for_event', { p_event_id: endedEventId }),
    ).toBe('registered');

    expect(
      await rpc(attendeeA, 'mark_event_attendance', {
        p_event_id: endedEventId,
        p_attendee_id: attendeeAId,
        p_attendance: 'attended',
      }),
    ).toBe('forbidden');

    expect(
      await rpc(organizerA, 'mark_event_attendance', {
        p_event_id: endedEventId,
        p_attendee_id: attendeeAId,
        p_attendance: 'attended',
      }),
    ).toBe('attendance_updated');

    const { error: eligibleFeedbackError } = await attendeeA
      .from('event_feedback')
      .insert({
        event_id: endedEventId,
        attendee_id: attendeeAId,
        rating: 5,
      });
    expect(eligibleFeedbackError).toBeNull();

    const { error: ineligibleFeedbackError } = await attendeeA
      .from('event_feedback')
      .insert({
        event_id: foreignEventId,
        attendee_id: attendeeAId,
        rating: 5,
      });
    expect(ineligibleFeedbackError).not.toBeNull();

    expect(
      await rpc(adminUser, 'mark_event_attendance', {
        p_event_id: endedEventId,
        p_attendee_id: attendeeAId,
        p_attendance: 'no_show',
      }),
    ).toBe('attendance_updated');
  });
});
