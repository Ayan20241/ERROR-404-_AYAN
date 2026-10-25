'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { EventCard } from '@/components/event-card';
import { LocationPicker } from '@/components/location-picker';
import {
  apiRequest,
  EVENT_CATEGORIES,
  formatEventDate,
  formatEventLocation,
  formatPrice,
  type EventRecord,
  type SessionResponse,
} from '@/lib/client/api';
import type { LocationChange } from '@/lib/locations/types';

type WorkspaceKind = 'attendee' | 'organizer' | 'admin';

interface Profile {
  display_name: string | null;
  role: WorkspaceKind;
  interests: string[];
  preferred_categories: string[];
  preferred_budget: number | null;
  preferred_location_label: string | null;
  preferred_latitude: number | null;
  preferred_longitude: number | null;
  preferred_radius_km: number;
}

interface Registration {
  id: string;
  event_id: string;
  status: string;
  attendance_status: string;
  event: EventRecord | null;
}

interface SavedEvent {
  id: string;
  event_id: string;
  event: EventRecord | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export function AttendeeWorkspace() {
  const router = useRouter();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [saved, setSaved] = useState<SavedEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<
    Array<{ event: EventRecord; score: number; reasons: string[] }>
  >([]);
  const [profileDraft, setProfileDraft] = useState<Partial<Profile>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    await Promise.resolve();
    try {
      const current = await apiRequest<SessionResponse>('/api/auth/session');
      setSession(current);
      setError('');
      if (!current.user) {
        setLoading(false);
        return;
      }
      if (current.role !== 'attendee') {
        setLoading(false);
        return;
      }
      const results = await Promise.allSettled([
        apiRequest<{ profile: Profile }>('/api/me/profile'),
        apiRequest<{ registrations: Registration[] }>('/api/me/registrations'),
        apiRequest<{ saved: SavedEvent[] }>('/api/me/saved'),
        apiRequest<{ notifications: Notification[] }>('/api/notifications'),
        apiRequest<{
          results: Array<{
            event: EventRecord;
            score: number;
            reasons: string[];
          }>;
        }>('/api/recommendations'),
      ]);
      const profileResult = results[0];
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.profile);
        setProfileDraft(profileResult.value.profile);
      }
      const unavailable: string[] = [];
      const names = [
        'profile',
        'registrations',
        'saved events',
        'notifications',
        'recommendations',
      ];
      const failureMessage = (result: PromiseSettledResult<unknown>) =>
        result.status === 'rejected' && result.reason instanceof Error
          ? result.reason.message
          : 'request failed';
      if (results[1].status === 'fulfilled')
        setRegistrations(results[1].value.registrations);
      else unavailable.push(`${names[1]}: ${failureMessage(results[1])}`);
      if (results[2].status === 'fulfilled') setSaved(results[2].value.saved);
      else unavailable.push(`${names[2]}: ${failureMessage(results[2])}`);
      if (results[3].status === 'fulfilled')
        setNotifications(results[3].value.notifications);
      else unavailable.push(`${names[3]}: ${failureMessage(results[3])}`);
      if (results[4].status === 'fulfilled')
        setRecommendations(results[4].value.results);
      else unavailable.push(`${names[4]}: ${failureMessage(results[4])}`);
      if (profileResult.status === 'rejected')
        unavailable.unshift(`${names[0]}: ${failureMessage(profileResult)}`);
      setError(
        unavailable.length
          ? `Some account data could not be loaded (${unavailable.join(', ')}). Retry to try again.`
          : '',
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Your space could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileDraft) return;
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        display_name: profileDraft.display_name || null,
        interests: profileDraft.interests ?? [],
        preferred_categories: profileDraft.preferred_categories ?? [],
        preferred_budget: profileDraft.preferred_budget,
        preferred_location_label: profileDraft.preferred_location_label || null,
        preferred_latitude: profileDraft.preferred_latitude,
        preferred_longitude: profileDraft.preferred_longitude,
        preferred_radius_km: profileDraft.preferred_radius_km,
      };
      const result = await apiRequest<{ profile: Profile }>('/api/me/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setProfile(result.profile);
      setProfileDraft(result.profile);
      setMessage('Preferences saved.');
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : 'Profile could not be saved.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeRegistration(registration: Registration) {
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(`/api/events/${registration.event_id}/register`, {
        method: registration.status === 'registered' ? 'DELETE' : 'POST',
      });
      await load();
      setMessage(
        registration.status === 'registered'
          ? 'Registration cancelled.'
          : 'Registration restored.',
      );
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Registration could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function markRead(notificationId?: string) {
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(
        notificationId
          ? `/api/notifications/${notificationId}/read`
          : '/api/notifications/read-all',
        {
          method: 'POST',
        },
      );
      const result = await apiRequest<{ notifications: Notification[] }>(
        '/api/notifications',
      );
      setNotifications(result.notifications);
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Notifications could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function becomeOrganizer() {
    setBusy(true);
    setMessage('');
    try {
      await apiRequest('/api/me/become-organizer', { method: 'POST' });
      router.push('/organizer');
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Organizer access could not be enabled.',
      );
      setBusy(false);
    }
  }

  async function submitFeedback(
    registration: Registration,
    formEvent: React.FormEvent<HTMLFormElement>,
  ) {
    formEvent.preventDefault();
    const formElement = formEvent.currentTarget;
    const data = new FormData(formElement);
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(`/api/events/${registration.event_id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          rating: Number(data.get('rating')),
          comment: String(data.get('comment') ?? ''),
        }),
      });
      setMessage('Feedback received. Thanks for showing up.');
      formElement.reset();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Feedback could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <WorkspaceLoading />;
  if (!session?.user) return <SignInGate />;
  if (session.role !== 'attendee')
    return (
      <WorkspaceError
        message="Attendee space is available to attendee accounts."
        retry={() =>
          router.push(
            session.role === 'admin'
              ? '/admin'
              : session.role === 'organizer'
                ? '/organizer'
                : '/',
          )
        }
      />
    );
  if (!profile)
    return (
      <WorkspaceError
        message={error || 'Your profile could not be loaded.'}
        retry={() => void load()}
      />
    );

  return (
    <div className="workspace content-wrap">
      <WorkspaceIntro
        eyebrow="Your local life"
        title={`Good plans, ${profile.display_name || 'right here'}.`}
        description="Your events, saved finds, and little details that make recommendations feel like yours."
      />
      {message && (
        <p className="notice-banner" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="inline-warning" role="status">
          {error}
        </p>
      )}
      <nav className="workspace-nav" aria-label="Your space">
        <a href="#profile">Preferences</a>
        <a href="#registrations">My events</a>
        <a href="#saved">Saved</a>
        <a href="#notifications">Notifications</a>
        <a href="#for-you">For you</a>
      </nav>
      <section className="workspace-section" id="profile">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">The little details</p>
            <h2>Your preferences</h2>
          </div>
          <span className="role-tag">{profile.role}</span>
        </div>
        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            Display name
            <input
              value={profileDraft.display_name ?? ''}
              maxLength={80}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  display_name: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Interests <small>Comma-separated</small>
            <input
              value={(profileDraft.interests ?? []).join(', ')}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  interests: event.target.value
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)
                    .slice(0, 30),
                }))
              }
              placeholder="Music, community, technology"
            />
          </label>
          <label>
            Preferred categories
            <select
              multiple
              value={profileDraft.preferred_categories ?? []}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_categories: Array.from(
                    event.target.selectedOptions,
                    (option) => option.value,
                  ),
                }))
              }
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Budget ceiling
            <input
              type="number"
              min="0"
              step="1"
              value={profileDraft.preferred_budget ?? ''}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_budget:
                    event.target.value === ''
                      ? null
                      : Number(event.target.value),
                }))
              }
              placeholder="No preference"
            />
          </label>
          <label>
            Location label
            <input
              value={profileDraft.preferred_location_label ?? ''}
              maxLength={120}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_location_label: event.target.value,
                }))
              }
              placeholder="Neighborhood or city"
            />
          </label>
          <label>
            Preferred radius · km
            <input
              type="number"
              min="1"
              max="500"
              value={profileDraft.preferred_radius_km ?? 10}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_radius_km: Number(event.target.value),
                }))
              }
            />
          </label>
          <label>
            Latitude
            <input
              type="number"
              min="-90"
              max="90"
              step="any"
              value={profileDraft.preferred_latitude ?? ''}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_latitude: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              min="-180"
              max="180"
              step="any"
              value={profileDraft.preferred_longitude ?? ''}
              onChange={(event) =>
                setProfileDraft((draft) => ({
                  ...draft,
                  preferred_longitude: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
            />
          </label>
          <button className="button button-dark" disabled={busy}>
            Save preferences
          </button>
        </form>
        {profile.role === 'attendee' && (
          <div className="organizer-invite">
            <div>
              <strong>Have something to host?</strong>
              <p>
                Become an organizer to publish and manage your own local events.
              </p>
            </div>
            <button
              className="button button-outline"
              onClick={() => void becomeOrganizer()}
              disabled={busy}
            >
              Become an organizer
            </button>
          </div>
        )}
      </section>
      <section className="workspace-section" id="registrations">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Plans in motion</p>
            <h2>My events</h2>
          </div>
          <span className="role-tag">{registrations.length} registrations</span>
        </div>
        {!registrations.length ? (
          <EmptyState
            title="Your calendar is still open."
            text="Find an event and save yourself a place."
            href="/"
            label="Explore events"
          />
        ) : (
          <div className="personal-event-list">
            {registrations.map((registration) => (
              <article className="personal-event" key={registration.id}>
                <div>
                  <span className="event-category">
                    {registration.event?.category ?? 'Event'}
                  </span>
                  <h3>
                    {registration.event?.title ?? 'Event details unavailable'}
                  </h3>
                  {registration.event && (
                    <p>
                      {formatEventDate(registration.event.start_at)} ·{' '}
                      {registration.event.venue_name ?? 'Venue to be announced'}{' '}
                      · {formatEventLocation(registration.event)}
                    </p>
                  )}
                  <span className="role-tag">
                    {registration.status} · {registration.attendance_status}
                  </span>
                </div>
                <div className="personal-event-actions">
                  {registration.status === 'registered' && (
                    <button
                      className="button button-outline"
                      onClick={() => void changeRegistration(registration)}
                      disabled={busy}
                    >
                      Cancel place
                    </button>
                  )}
                  {registration.event &&
                    new Date(registration.event.end_at) < new Date() &&
                    registration.attendance_status === 'attended' && (
                      <form
                        className="feedback-form"
                        onSubmit={(event) =>
                          void submitFeedback(registration, event)
                        }
                      >
                        <label>
                          Rating
                          <select name="rating" defaultValue="5">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} / 5
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Feedback
                          <textarea
                            name="comment"
                            maxLength={1000}
                            placeholder="What stayed with you?"
                          />
                        </label>
                        <button className="button button-dark" disabled={busy}>
                          Send feedback
                        </button>
                      </form>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="workspace-section" id="saved">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Keep close</p>
            <h2>Saved for later</h2>
          </div>
        </div>
        {!saved.length ? (
          <EmptyState
            title="Nothing tucked away yet."
            text="Save an event card to keep it here."
            href="/"
            label="Browse events"
          />
        ) : (
          <div className="event-grid">
            {saved.map(
              (item) =>
                item.event && (
                  <EventCard
                    key={item.id}
                    event={item.event}
                    session={session}
                    initiallySaved
                  />
                ),
            )}
          </div>
        )}
      </section>
      <section className="workspace-section" id="notifications">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">The latest</p>
            <h2>Notifications</h2>
          </div>
          {notifications.some((item) => !item.read_at) && (
            <button
              className="text-button"
              onClick={() => void markRead()}
              disabled={busy}
            >
              Mark all read
            </button>
          )}
        </div>
        {!notifications.length ? (
          <EmptyState
            title="All quiet here."
            text="Event confirmations and updates will appear here."
          />
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <article
                className={`notification-item${notification.read_at ? '' : ' notification-unread'}`}
                key={notification.id}
              >
                <div>
                  <p className="eyebrow">
                    {notification.type.replaceAll('_', ' ')}
                  </p>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <time>{formatEventDate(notification.created_at)}</time>
                </div>
                {!notification.read_at && (
                  <button
                    className="text-button"
                    onClick={() => void markRead(notification.id)}
                    disabled={busy}
                  >
                    Mark read
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="workspace-section" id="for-you">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">SmartMatch · real signals</p>
            <h2>Picked for you</h2>
          </div>
          <Link className="text-button" href="/">
            Explore all
          </Link>
        </div>
        {!recommendations.length ? (
          <EmptyState
            title="Your next match is out there."
            text="We’ll show recommendations when eligible events are available and the service is ready."
          />
        ) : (
          <div className="event-grid">
            {recommendations.slice(0, 3).map((item) => (
              <EventCard
                key={item.event.id}
                event={item.event}
                session={session}
                match={item}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function OrganizerWorkspace() {
  const router = useRouter();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [stats, setStats] = useState<{
    events: Array<{
      id: string;
      title: string;
      registrations: number;
      remaining_capacity: number;
      views: number;
    }>;
    totalRegistrations: number;
    totalViews: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [attendees, setAttendees] = useState<
    Array<{
      attendee_id: string;
      display_name: string | null;
      registration_status: string;
      attendance_status: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [publish, setPublish] = useState(false);
  const [eventLocation, setEventLocation] = useState<LocationChange>({
    stateCode: '',
    cityId: '',
    locality: '',
  });

  const load = useCallback(async () => {
    await Promise.resolve();
    try {
      const current = await apiRequest<SessionResponse>('/api/auth/session');
      setSession(current);
      setError('');
      if (!current.user || !['organizer', 'admin'].includes(current.role ?? ''))
        return;
      const [eventResult, statResult] = await Promise.allSettled([
        apiRequest<{ events: EventRecord[] }>('/api/organizer/events'),
        apiRequest<typeof stats>('/api/organizer/stats'),
      ]);
      if (eventResult.status === 'fulfilled') {
        setEvents(eventResult.value.events);
        setSelectedEvent(
          (currentId) => currentId || eventResult.value.events[0]?.id || '',
        );
      } else
        setError(
          eventResult.reason instanceof Error
            ? eventResult.reason.message
            : 'Events unavailable.',
        );
      if (statResult.status === 'fulfilled') setStats(statResult.value);
      else
        setMessage(
          statResult.reason instanceof Error
            ? statResult.reason.message
            : 'Statistics unavailable.',
        );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Organizer space unavailable.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (
      !selectedEvent ||
      (session?.role !== 'organizer' && session?.role !== 'admin')
    )
      return;
    apiRequest<{ attendees: typeof attendees }>(
      `/api/organizer/events/${selectedEvent}/attendees`,
    )
      .then((result) => setAttendees(result.attendees))
      .catch((requestError: unknown) =>
        setMessage(
          requestError instanceof Error
            ? requestError.message
            : 'Attendees unavailable.',
        ),
      );
  }, [selectedEvent, session]);

  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const numberOrNull = (key: string) =>
      String(form.get(key) ?? '').trim() ? Number(form.get(key)) : null;
    const payload = {
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      category: String(form.get('category') ?? ''),
      venue_name: String(form.get('venue_name') ?? ''),
      address: String(form.get('address') ?? ''),
      country_code: 'IN',
      state_code: eventLocation.stateCode,
      city_id: eventLocation.cityId,
      locality: eventLocation.locality.trim() || null,
      latitude: numberOrNull('latitude'),
      longitude: numberOrNull('longitude'),
      start_at: new Date(String(form.get('start_at'))).toISOString(),
      end_at: new Date(String(form.get('end_at'))).toISOString(),
      price: Number(form.get('price') || 0),
      currency: 'INR',
      capacity: Number(form.get('capacity')),
      registration_deadline: String(form.get('registration_deadline') ?? '')
        ? new Date(String(form.get('registration_deadline'))).toISOString()
        : null,
      image_url: String(form.get('image_url') ?? '') || null,
      publish,
    };
    if ((payload.latitude === null) !== (payload.longitude === null)) {
      setMessage('Enter both coordinates, or leave both blank.');
      return;
    }
    if (!payload.state_code || !payload.city_id) {
      setMessage('Choose a valid Indian state or territory and city.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await apiRequest('/api/organizer/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      formElement.reset();
      setEventLocation({ stateCode: '', cityId: '', locality: '' });
      setPublish(false);
      setMessage(
        publish ? 'Event created and published.' : 'Draft event created.',
      );
      await load();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Event could not be created.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function editEvent(
    eventId: string,
    changes: {
      title: string;
      publish: boolean;
      state_code: string;
      city_id: string;
      locality: string | null;
      venue_name: string;
      address: string;
    },
  ) {
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(`/api/organizer/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify(changes),
      });
      setMessage('Event details updated.');
      await load();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Event could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancelEvent(eventId: string) {
    if (
      !window.confirm(
        'Cancel this event? Registered attendees will be notified.',
      )
    )
      return;
    setBusy(true);
    try {
      await apiRequest(`/api/organizer/events/${eventId}/cancel`, {
        method: 'POST',
      });
      setMessage('Event cancelled. Registered attendees were notified.');
      await load();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Event could not be cancelled.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateAttendance(
    attendeeId: string,
    attendanceStatus: 'attended' | 'no_show',
  ) {
    if (!selectedEvent) return;
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(`/api/organizer/events/${selectedEvent}/attendance`, {
        method: 'PATCH',
        body: JSON.stringify({ attendeeId, attendanceStatus }),
      });
      setAttendees((current) =>
        current.map((person) =>
          person.attendee_id === attendeeId
            ? { ...person, attendance_status: attendanceStatus }
            : person,
        ),
      );
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Attendance could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <WorkspaceLoading />;
  if (!session?.user) return <SignInGate />;
  if (!['organizer', 'admin'].includes(session.role ?? ''))
    return (
      <WorkspaceError
        message="Organizer access is required."
        retry={() => router.push('/me')}
      />
    );

  return (
    <div className="workspace content-wrap">
      <WorkspaceIntro
        eyebrow="Your events, your people"
        title="Bring people together."
        description="Keep the details current, see your real registrations, and look after the room."
      />
      {error && <WorkspaceError message={error} retry={() => void load()} />}
      {message && (
        <p className="notice-banner" role="status">
          {message}
        </p>
      )}
      {stats && (
        <div className="stats-strip">
          <StatCard label="Registrations" value={stats.totalRegistrations} />
          <StatCard label="Event views" value={stats.totalViews} />
          <StatCard label="Your events" value={events.length} />
        </div>
      )}
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">The calendar</p>
            <h2>Your events</h2>
          </div>
        </div>
        {!events.length ? (
          <EmptyState
            title="Nothing on your calendar yet."
            text="Start with a draft, then publish when the details are ready."
          />
        ) : (
          <div className="organizer-event-list">
            {events.map((event) => (
              <article className="organizer-event" key={event.id}>
                <div className="organizer-event-main">
                  <span className="role-tag">{event.status}</span>
                  <h3>{event.title}</h3>
                  <p>
                    {formatEventDate(event.start_at)} ·{' '}
                    {formatPrice(event.price, event.currency)} ·{' '}
                    {Math.max(0, event.capacity - event.registered_count)}{' '}
                    places remaining
                  </p>
                  <p>
                    {formatEventLocation(event)}
                    {event.venue_name ? ` · ${event.venue_name}` : ''}
                  </p>
                </div>
                <div className="organizer-actions">
                  <OrganizerEventEditForm
                    event={event}
                    busy={busy}
                    onSave={(changes) => void editEvent(event.id, changes)}
                  />
                  {event.status !== 'cancelled' && (
                    <button
                      className="button button-danger"
                      onClick={() => void cancelEvent(event.id)}
                      disabled={busy}
                    >
                      Cancel event
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Make a gathering</p>
            <h2>Create an event</h2>
          </div>
        </div>
        <LocationPicker
          idPrefix="create-event"
          value={eventLocation}
          onChange={setEventLocation}
          required
        />
        <form
          className="event-create-form"
          onSubmit={(event) => void createEvent(event)}
        >
          <label>
            Event title
            <input name="title" maxLength={140} required />
          </label>
          <label>
            Category
            <select name="category" required>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="span-two">
            Description
            <textarea name="description" maxLength={5000} rows={4} required />
          </label>
          <label>
            Venue
            <input name="venue_name" maxLength={160} required />
          </label>
          <label>
            Address
            <input name="address" maxLength={500} required />
          </label>
          <label>
            Starts
            <input type="datetime-local" name="start_at" required />
          </label>
          <label>
            Ends
            <input type="datetime-local" name="end_at" required />
          </label>
          <label>
            Capacity
            <input type="number" name="capacity" min="1" required />
          </label>
          <label>
            Price · INR
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              defaultValue="0"
            />
          </label>
          <label>
            Registration deadline
            <input type="datetime-local" name="registration_deadline" />
          </label>
          <label>
            Image URL · HTTPS
            <input type="url" name="image_url" placeholder="https://…" />
          </label>
          <label>
            Latitude
            <input
              type="number"
              name="latitude"
              min="-90"
              max="90"
              step="any"
            />
          </label>
          <label>
            Longitude
            <input
              type="number"
              name="longitude"
              min="-180"
              max="180"
              step="any"
            />
          </label>
          <label className="publish-toggle">
            <input
              type="checkbox"
              checked={publish}
              onChange={(event) => setPublish(event.target.checked)}
            />{' '}
            Publish immediately
          </label>
          <button className="button button-dark" disabled={busy}>
            {busy ? 'Creating…' : publish ? 'Create & publish' : 'Create draft'}
          </button>
        </form>
      </section>
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">The people coming</p>
            <h2>Attendees & attendance</h2>
          </div>
        </div>
        <label className="compact-select">
          Choose event
          <select
            value={selectedEvent}
            onChange={(event) => setSelectedEvent(event.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
        {!attendees.length ? (
          <p className="muted">
            No attendee details are available for this event.
          </p>
        ) : (
          <div className="attendee-table-wrap">
            <table className="attendee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration</th>
                  <th>Attendance</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.attendee_id}>
                    <td>{attendee.display_name || 'Attendee'}</td>
                    <td>{attendee.registration_status}</td>
                    <td>{attendee.attendance_status}</td>
                    <td>
                      <select
                        aria-label={`Attendance for ${attendee.display_name || 'attendee'}`}
                        value={
                          attendee.attendance_status === 'attended' ||
                          attendee.attendance_status === 'no_show'
                            ? attendee.attendance_status
                            : ''
                        }
                        onChange={(event) => {
                          if (
                            event.target.value === 'attended' ||
                            event.target.value === 'no_show'
                          )
                            void updateAttendance(
                              attendee.attendee_id,
                              event.target.value,
                            );
                        }}
                        disabled={busy}
                      >
                        <option value="">Not marked</option>
                        <option value="attended">Attended</option>
                        <option value="no_show">No show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Real signals, no guesswork</p>
            <h2>Event performance</h2>
          </div>
        </div>
        {!stats?.events?.length ? (
          <p className="muted">
            No aggregate data is available yet. If Migration 004 is not applied,
            the API will report that clearly.
          </p>
        ) : (
          <div className="stats-table">
            {stats.events.map((item) => (
              <article key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.registrations} registrations ·{' '}
                    {item.remaining_capacity} places left
                  </p>
                </div>
                <strong>
                  {item.views}
                  <small> views</small>
                </strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function AdminWorkspace() {
  const router = useRouter();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [events, setEvents] = useState<
    Array<{ event: EventRecord; flagged: boolean }>
  >([]);
  const [stats, setStats] = useState<{
    users: number;
    events: number;
    registrations: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    await Promise.resolve();
    try {
      const current = await apiRequest<SessionResponse>('/api/auth/session');
      setSession(current);
      setError('');
      if (current.role !== 'admin') return;
      const [eventResult, statsResult] = await Promise.allSettled([
        apiRequest<{
          events: Array<{ event: EventRecord; flagged: boolean }>;
          total: number;
        }>('/api/admin/events'),
        apiRequest<typeof stats>('/api/admin/stats'),
      ]);
      if (eventResult.status === 'fulfilled')
        setEvents(eventResult.value.events);
      else
        setError(
          eventResult.reason instanceof Error
            ? eventResult.reason.message
            : 'Moderation list unavailable.',
        );
      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      else
        setMessage(
          statsResult.reason instanceof Error
            ? statsResult.reason.message
            : 'Platform totals unavailable.',
        );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Admin workspace unavailable.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  async function moderate(item: { event: EventRecord; flagged: boolean }) {
    const action = item.flagged ? 'restore' : 'remove';
    const prompt = item.flagged
      ? `Restore “${item.event.title}” to its prior status?`
      : `Remove “${item.event.title}” from discovery? The organizer will be notified.`;
    if (!window.confirm(prompt)) return;
    setBusyId(item.event.id);
    setMessage('');
    try {
      await apiRequest(`/api/admin/events/${item.event.id}/${action}`, {
        method: 'POST',
      });
      setMessage(
        item.flagged
          ? 'Event restored.'
          : 'Event removed and organizer notified.',
      );
      await load();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Moderation action failed.',
      );
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <WorkspaceLoading />;
  if (!session?.user) return <SignInGate />;
  if (session.role !== 'admin')
    return (
      <WorkspaceError
        message="Administrator access is required."
        retry={() => router.push('/')}
      />
    );

  return (
    <div className="workspace content-wrap">
      <WorkspaceIntro
        eyebrow="Trust & safety"
        title="Keep the local scene welcoming."
        description="Review event listings and take moderation actions. User reports are not available in this API."
      />
      {message && (
        <p className="notice-banner" role="status">
          {message}
        </p>
      )}
      {error && <WorkspaceError message={error} retry={() => void load()} />}
      {stats && (
        <div className="stats-strip">
          <StatCard label="People" value={stats.users} />
          <StatCard label="Events" value={stats.events} />
          <StatCard label="Registrations" value={stats.registrations} />
        </div>
      )}
      <section className="workspace-section">
        <div className="workspace-section-heading">
          <div>
            <p className="eyebrow">Event listings</p>
            <h2>Moderation queue</h2>
          </div>
          <span className="role-tag">
            {events.filter((event) => event.flagged).length} moderated
          </span>
        </div>
        {!events.length ? (
          <EmptyState
            title="No event listings returned."
            text="The moderation list may be unavailable until its database migration is applied."
          />
        ) : (
          <div className="admin-event-list">
            {events.map((item) => (
              <article className="admin-event" key={item.event.id}>
                <div>
                  <span
                    className={`role-tag${item.flagged ? ' role-tag-warning' : ''}`}
                  >
                    {item.flagged ? 'Moderated' : item.event.status}
                  </span>
                  <h3>{item.event.title}</h3>
                  <p>
                    {item.event.category} ·{' '}
                    {formatEventDate(item.event.start_at)} ·{' '}
                    {formatPrice(item.event.price, item.event.currency)}
                  </p>
                  <p>{formatEventLocation(item.event)}</p>
                  <p className="admin-description">{item.event.description}</p>
                </div>
                <button
                  className={
                    item.flagged
                      ? 'button button-outline'
                      : 'button button-danger'
                  }
                  onClick={() => void moderate(item)}
                  disabled={busyId === item.event.id}
                >
                  {busyId === item.event.id
                    ? 'Updating…'
                    : item.flagged
                      ? 'Restore listing'
                      : 'Remove listing'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OrganizerEventEditForm({
  event,
  busy,
  onSave,
}: {
  event: EventRecord;
  busy: boolean;
  onSave: (changes: {
    title: string;
    publish: boolean;
    state_code: string;
    city_id: string;
    locality: string | null;
    venue_name: string;
    address: string;
  }) => void;
}) {
  const [location, setLocation] = useState<LocationChange>({
    stateCode: event.state_code ?? '',
    cityId: event.city_id ?? '',
    locality: event.locality ?? '',
  });

  return (
    <form
      className="quick-edit"
      onSubmit={(formEvent) => {
        formEvent.preventDefault();
        const data = new FormData(formEvent.currentTarget);
        onSave({
          title: String(data.get('title') ?? ''),
          publish: data.get('publish') === 'true',
          state_code: location.stateCode,
          city_id: location.cityId,
          locality: location.locality.trim() || null,
          venue_name: String(data.get('venue_name') ?? ''),
          address: String(data.get('address') ?? ''),
        });
      }}
    >
      <label>
        Title
        <input
          name="title"
          aria-label={`Edit title for ${event.title}`}
          defaultValue={event.title}
          maxLength={140}
          required
        />
      </label>
      <LocationPicker
        idPrefix={`edit-${event.id}`}
        value={location}
        onChange={setLocation}
        required
      />
      <label>
        Venue name
        <input
          name="venue_name"
          defaultValue={event.venue_name ?? ''}
          maxLength={160}
          required
        />
      </label>
      <label>
        Address
        <input
          name="address"
          defaultValue={event.address ?? ''}
          maxLength={500}
          required
        />
      </label>
      <label>
        Publication
        <select
          name="publish"
          aria-label="Publish status"
          defaultValue={event.status === 'published' ? 'true' : 'false'}
        >
          <option value="false">Keep as draft</option>
          <option value="true">Publish</option>
        </select>
      </label>
      <button className="button button-outline" disabled={busy}>
        Update event
      </button>
    </form>
  );
}

function WorkspaceIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="workspace-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function WorkspaceLoading() {
  return (
    <div className="content-wrap page-loading" role="status">
      Getting your space ready…
    </div>
  );
}

function WorkspaceError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="error-panel content-wrap" role="alert">
      <div>
        <strong>This page needs a little help.</strong>
        <p>{message}</p>
      </div>
      <button className="button button-outline" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

function SignInGate() {
  return (
    <section className="content-wrap signin-gate">
      <p className="eyebrow">Your corner</p>
      <h1>Sign in to see your events.</h1>
      <p>Keep registrations, saved finds, and updates together.</p>
      <Link href="/signin" className="button button-dark">
        Sign in
      </Link>
    </section>
  );
}

function EmptyState({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="soft-empty">
      <strong>{title}</strong>
      <p>{text}</p>
      {href && label && (
        <Link className="button button-outline" href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{new Intl.NumberFormat().format(value)}</strong>
    </article>
  );
}
