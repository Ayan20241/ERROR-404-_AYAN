'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  apiRequest,
  formatEventDate,
  formatEventLocation,
  formatPrice,
  type EventRecord,
  type SessionResponse,
} from '@/lib/client/api';

export function EventDetailPage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [registered, setRegistered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ event: EventRecord }>(`/api/events/${eventId}`),
      apiRequest<SessionResponse>('/api/auth/session').catch(() => ({
        user: null,
        role: null,
      })),
    ])
      .then(async ([eventResult, sessionResult]) => {
        if (!active) return;
        setEvent(eventResult.event);
        setSession(sessionResult);
        if (sessionResult.user) {
          const isAttendee = sessionResult.role === 'attendee';
          const registrationRequest = isAttendee
            ? apiRequest<{
                registrations: Array<{ event_id: string; status: string }>;
              }>('/api/me/registrations')
            : Promise.resolve({ registrations: [] });
          const savedRequest = isAttendee
            ? apiRequest<{ saved: Array<{ event_id: string }> }>(
                '/api/me/saved',
              )
            : Promise.resolve({ saved: [] });
          const [registrationResult, savedResult] = await Promise.allSettled([
            registrationRequest,
            savedRequest,
          ]);
          if (active) {
            if (registrationResult.status === 'fulfilled') {
              setRegistered(
                registrationResult.value.registrations.some(
                  (registration) =>
                    registration.event_id === eventId &&
                    registration.status === 'registered',
                ),
              );
            }
            if (savedResult.status === 'fulfilled') {
              setSaved(
                savedResult.value.saved.some(
                  (item) => item.event_id === eventId,
                ),
              );
            }
            if (
              registrationResult.status === 'rejected' ||
              savedResult.status === 'rejected'
            ) {
              setActionMessage(
                'Some attendee actions could not be loaded. Refresh to try again.',
              );
            }
          }
        }
      })
      .catch((requestError: unknown) => {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Event could not be loaded.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  async function registrationAction() {
    if (!session?.user) {
      router.push(`/signin?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }

    setBusy(true);
    setActionMessage('');
    try {
      await apiRequest(`/api/events/${eventId}/register`, {
        method: registered ? 'DELETE' : 'POST',
      });
      setRegistered(!registered);
      setActionMessage(
        registered
          ? 'Your place was released.'
          : 'You’re on the list. See you there.',
      );
    } catch (requestError) {
      setActionMessage(
        requestError instanceof Error
          ? requestError.message
          : 'This action could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleSaved() {
    if (!session?.user) {
      router.push(`/signin?next=${encodeURIComponent(`/events/${eventId}`)}`);
      return;
    }
    if (session.role !== 'attendee') return;
    setBusy(true);
    setActionMessage('');
    try {
      await apiRequest(`/api/events/${eventId}/save`, {
        method: saved ? 'DELETE' : 'POST',
      });
      setSaved(!saved);
      setActionMessage(
        saved ? 'Removed from your saved events.' : 'Saved for later.',
      );
    } catch (requestError) {
      setActionMessage(
        requestError instanceof Error
          ? requestError.message
          : 'Save could not be updated.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div className="content-wrap page-loading" role="status">
        Opening event details…
      </div>
    );
  if (error || !event) {
    return (
      <section className="content-wrap error-page">
        <p className="eyebrow">That didn’t work</p>
        <h1>We can’t find this event.</h1>
        <p>{error || 'Event not found.'}</p>
        <Link className="button button-dark" href="/">
          Back to discovery
        </Link>
      </section>
    );
  }

  const available = Math.max(0, event.capacity - event.registered_count);
  const ownEvent = session?.user?.id === event.organizer_id;
  const canRegister =
    event.status === 'published' &&
    !ownEvent &&
    session?.role === 'attendee' &&
    (registered || available > 0);

  return (
    <article className="detail-page content-wrap">
      <Link className="back-link" href="/">
        ← Back to all events
      </Link>
      <div className="detail-layout">
        <div>
          <div
            className="detail-poster"
            style={
              event.image_url
                ? {
                    backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(18,16,12,.74)), url("${event.image_url}")`,
                  }
                : undefined
            }
          >
            <span className="detail-category">{event.category}</span>
            <span className="detail-price">
              {formatPrice(event.price, event.currency)}
            </span>
            {!event.image_url && (
              <span className="detail-art-word">{event.category}</span>
            )}
          </div>
          <div className="detail-description">
            <p className="eyebrow">The gathering</p>
            <h2>About this event</h2>
            <p className="description-copy">{event.description}</p>
          </div>
        </div>
        <aside className="detail-aside">
          <p className="eyebrow">
            {event.status === 'published' ? 'On the calendar' : event.status}
          </p>
          <h1>{event.title}</h1>
          <p className="detail-date">{formatEventDate(event.start_at)}</p>
          <p className="detail-date">Ends {formatEventDate(event.end_at)}</p>
          <div className="detail-rule" />
          <dl className="detail-facts">
            <div>
              <dt>Where</dt>
              <dd>
                {event.venue_name || 'Venue details coming soon'}
                {event.city_id && (
                  <span className="detail-location">
                    {formatEventLocation(event)}
                  </span>
                )}
              </dd>
            </div>
            {event.address && (
              <div>
                <dt>Address</dt>
                <dd>{event.address}</dd>
              </div>
            )}
            <div>
              <dt>Entry</dt>
              <dd>{formatPrice(event.price, event.currency)}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>
                {available === 0 ? 'Fully booked' : `${available} places left`}
              </dd>
            </div>
            <div>
              <dt>Host</dt>
              <dd>Community organizer</dd>
            </div>
          </dl>
          {canRegister ? (
            <button
              className="button button-dark button-wide"
              onClick={() => void registrationAction()}
              disabled={busy}
            >
              {busy
                ? 'Updating…'
                : registered
                  ? 'Cancel my place'
                  : 'Save me a place'}
            </button>
          ) : (
            <p className="detail-note">
              {ownEvent
                ? 'This is your event.'
                : session?.user && session.role !== 'attendee'
                  ? 'Registration is available to attendee accounts.'
                  : event.status !== 'published'
                    ? 'This event is not open for registration.'
                    : available === 0
                      ? 'This event is fully booked.'
                      : 'Registration is unavailable.'}
            </p>
          )}
          {!session?.user && (
            <p className="signin-prompt">
              <Link
                href={`/signin?next=${encodeURIComponent(`/events/${eventId}`)}`}
              >
                Sign in
              </Link>{' '}
              to register or save this event.
            </p>
          )}
          {event.status === 'published' && session?.role === 'attendee' && (
            <button
              className="button button-outline button-wide save-detail"
              onClick={() => void toggleSaved()}
              disabled={busy}
            >
              {saved ? 'Saved for later · Remove' : 'Save for later'}
            </button>
          )}
          {actionMessage && (
            <p className="inline-warning" role="status">
              {actionMessage}
            </p>
          )}
          <p className="host-note">
            Host identity details aren’t included in the event API yet.
          </p>
        </aside>
      </div>
    </article>
  );
}
