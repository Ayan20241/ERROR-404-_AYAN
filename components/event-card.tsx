'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  apiRequest,
  formatEventDate,
  formatEventLocation,
  formatPrice,
  type EventRecord,
  type SessionResponse,
} from '@/lib/client/api';

export function EventCard({
  event,
  session,
  match,
  initiallySaved = false,
}: {
  event: EventRecord;
  session: SessionResponse | null;
  match?: { score: number; reasons: string[] };
  initiallySaved?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const available = Math.max(0, event.capacity - event.registered_count);
  const date = new Date(event.start_at);

  async function toggleSave() {
    if (!session?.user) {
      router.push(`/signin?next=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await apiRequest(`/api/events/${event.id}/save`, {
        method: saved ? 'DELETE' : 'POST',
      });
      setSaved(!saved);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not update saved event.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="event-card">
      <Link
        className="poster-link"
        href={`/events/${event.id}`}
        aria-label={`View ${event.title}`}
      >
        <div
          className={`event-poster category-${event.category
            .toLowerCase()
            .replace(/[^a-z]+/g, '-')}`}
          style={
            event.image_url
              ? {
                  backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(18,16,12,.68)), url("${event.image_url}")`,
                }
              : undefined
          }
        >
          <span className="date-stamp">
            <b>{date.toLocaleDateString(undefined, { day: '2-digit' })}</b>
            <small>
              {date.toLocaleDateString(undefined, { month: 'short' })}
            </small>
          </span>
          {match && <span className="match-pill">{match.score}% match</span>}
          <span className="price-pill">
            {formatPrice(event.price, event.currency)}
          </span>
          {!event.image_url && (
            <span className="poster-title" aria-hidden="true">
              {event.category}
            </span>
          )}
        </div>
      </Link>
      <div className="event-card-body">
        <div className="event-category">{event.category}</div>
        <h3>
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="event-venue">
          {event.venue_name || event.address || 'Venue details coming soon'}
        </p>
        <p className="event-location">{formatEventLocation(event)}</p>
        <p className="event-time">{formatEventDate(event.start_at)}</p>
        {match?.reasons[0] && (
          <p className="match-reason">{match.reasons[0]}</p>
        )}
        <div className="event-card-footer">
          <span className={available <= 5 ? 'spots-low' : 'spots-ok'}>
            {available === 0
              ? 'Fully booked'
              : available <= 5
                ? `${available} spots left`
                : `${available} spots available`}
          </span>
          <button
            className={`save-button${saved ? ' is-saved' : ''}`}
            type="button"
            onClick={() => void toggleSave()}
            disabled={busy || (!!session?.user && session.role !== 'attendee')}
            aria-label={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
            title={saved ? 'Saved' : 'Save event'}
          >
            {busy
              ? '…'
              : session?.user && session.role !== 'attendee'
                ? 'Attendees'
                : saved
                  ? 'Saved'
                  : 'Save'}
          </button>
        </div>
        {message && (
          <p className="inline-error" role="status">
            {message}
          </p>
        )}
      </div>
    </article>
  );
}
