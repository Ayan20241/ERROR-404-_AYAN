'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { EventCard } from '@/components/event-card';
import { EventMap } from '@/components/event-map';
import { LocationPicker } from '@/components/location-picker';
import {
  apiRequest,
  buildEventSearchParams,
  EVENT_CATEGORIES,
  type EventRecord,
  type SessionResponse,
} from '@/lib/client/api';

interface SearchForm {
  q: string;
  category: string;
  date: string;
  maxPrice: string;
  latitude: string;
  longitude: string;
  radiusKm: string;
  stateCode: string;
  cityId: string;
  locality: string;
}

interface Recommendation {
  event: EventRecord;
  score: number;
  reasons: string[];
}

const initialSearch: SearchForm = {
  q: '',
  category: '',
  date: '',
  maxPrice: '',
  latitude: '',
  longitude: '',
  radiusKm: '',
  stateCode: '',
  cityId: '',
  locality: '',
};

export function DiscoveryPage() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [form, setForm] = useState(initialSearch);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [resultView, setResultView] = useState<'list' | 'map'>('list');
  const [error, setError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [page, setPage] = useState(1);

  const loadEvents = useCallback(
    async (nextPage: number, filters: SearchForm) => {
      await Promise.resolve();
      let params: URLSearchParams;
      try {
        params = buildEventSearchParams(nextPage, filters);
      } catch (requestError) {
        await Promise.resolve();
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Check the selected date and search filters, then try again.',
        );
        setLoading(false);
        return;
      }

      try {
        const result = await apiRequest<{
          events: EventRecord[];
          total: number;
        }>(`/api/events?${params.toString()}`);
        setEvents(result.events);
        setTotal(result.total);
        setPage(nextPage);
      } catch (requestError) {
        setEvents([]);
        setTotal(0);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Events could not be loaded.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    void apiRequest<SessionResponse>('/api/auth/session')
      .then((result) => {
        if (active) setSession(result);
      })
      .catch(() => {
        if (active) setSession({ user: null, role: null });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const current = new URLSearchParams(window.location.search);
      const dateFrom = current.get('dateFrom');
      const filters: SearchForm = {
        ...initialSearch,
        q: current.get('q') ?? '',
        category: current.get('category') ?? '',
        date: dateFrom ? dateFrom.slice(0, 10) : '',
        maxPrice: current.get('maxPrice') ?? '',
        latitude: current.get('lat') ?? '',
        longitude: current.get('lng') ?? '',
        radiusKm: current.get('radiusKm') ?? '',
        stateCode: current.get('stateCode') ?? '',
        cityId: current.get('cityId') ?? '',
        locality: current.get('locality') ?? '',
      };
      setForm(filters);
      void loadEvents(1, filters);
    });
  }, [loadEvents]);

  useEffect(() => {
    if (session?.role !== 'attendee') return;
    let active = true;
    const loadRecommendations = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoadingMatches(true);
      setMatchError('');
      const recommendationParams = new URLSearchParams();
      if (form.stateCode) recommendationParams.set('stateCode', form.stateCode);
      if (form.cityId) recommendationParams.set('cityId', form.cityId);
      if (form.locality.trim())
        recommendationParams.set('locality', form.locality.trim());
      if (form.latitude && form.longitude) {
        recommendationParams.set('lat', form.latitude);
        recommendationParams.set('lng', form.longitude);
        if (form.radiusKm) recommendationParams.set('radiusKm', form.radiusKm);
      }
      const query = recommendationParams.toString();
      try {
        const result = await apiRequest<{ results: Recommendation[] }>(
          `/api/recommendations${query ? `?${query}` : ''}`,
        );
        if (active) setRecommendations(result.results);
      } catch (requestError) {
        if (active) {
          setRecommendations([]);
          setMatchError(
            requestError instanceof Error
              ? requestError.message
              : 'Recommendations are unavailable.',
          );
        }
      } finally {
        if (active) setLoadingMatches(false);
      }
    };
    void loadRecommendations();
    return () => {
      active = false;
    };
  }, [
    form.cityId,
    form.latitude,
    form.locality,
    form.longitude,
    form.radiusKm,
    form.stateCode,
    session,
  ]);

  function updateField(key: keyof SearchForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function searchEvents(nextPage: number, filters: SearchForm) {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set('q', filters.q.trim());
    if (filters.category) params.set('category', filters.category);
    if (filters.date) {
      params.set(
        'dateFrom',
        new Date(`${filters.date}T00:00:00`).toISOString(),
      );
      params.set(
        'dateTo',
        new Date(`${filters.date}T23:59:59.999`).toISOString(),
      );
    }
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.latitude) params.set('lat', filters.latitude);
    if (filters.longitude) params.set('lng', filters.longitude);
    if (filters.radiusKm) params.set('radiusKm', filters.radiusKm);
    if (filters.stateCode) params.set('stateCode', filters.stateCode);
    if (filters.cityId) params.set('cityId', filters.cityId);
    if (filters.locality.trim())
      params.set('locality', filters.locality.trim());
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `/?${query}#events` : '/#events',
    );
    void loadEvents(nextPage, filters);
  }

  async function requestMyLocation() {
    setError('');
    if (!navigator.geolocation) {
      setError(
        'Location is not available in this browser. Enter coordinates instead.',
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(5),
          longitude: position.coords.longitude.toFixed(5),
          radiusKm: current.radiusKm || '10',
        }));
      },
      () =>
        setError(
          'Location access was unavailable. You can enter coordinates manually.',
        ),
      { maximumAge: 60_000, timeout: 8_000 },
    );
  }

  return (
    <>
      <section className="discovery-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-light">Your city, in good company</p>
            <h1>
              Make room
              <br />
              for <em>something</em>
              <br />
              local.
            </h1>
            <p className="hero-subtitle">
              Small plans. New people. The good stuff happening just around the
              corner.
            </p>
            <a className="button button-coral" href="#events">
              Find your next thing <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div
            className="hero-art"
            aria-label="A snapshot of local event categories"
          >
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-sticker sticker-top">
              NEAR
              <br />
              YOU
            </div>
            <div className="hero-sticker sticker-bottom">
              GOOD
              <br />
              THINGS
              <br />
              GATHER
            </div>
            <div className="hero-vertical">
              HYPERLOCAL · OPEN DOORS · NEW PLACES
            </div>
          </div>
        </div>
        <div className="hero-footnote">
          <span className="live-dot" /> FIND WHAT’S ON, NOT WHAT’S TRENDING
        </div>
      </section>

      {session?.role === 'attendee' && (
        <section
          className="match-section content-wrap"
          aria-labelledby="match-title"
        >
          <div className="section-heading match-heading">
            <div>
              <p className="eyebrow">A little more you</p>
              <h2 id="match-title">Picked for your kind of day.</h2>
            </div>
            <span className="match-label">SMARTMATCH · EXPLAINABLE PICKS</span>
          </div>
          {loadingMatches ? (
            <div className="loading-row" aria-live="polite">
              Finding your next good plan…
            </div>
          ) : matchError ? (
            <div className="inline-warning" role="status">
              Recommendations aren’t available right now: {matchError}
            </div>
          ) : recommendations.length ? (
            <div className="event-grid recommendation-grid">
              {recommendations.slice(0, 3).map((item) => (
                <EventCard
                  key={item.event.id}
                  event={item.event}
                  session={session}
                  match={{ score: item.score, reasons: item.reasons }}
                />
              ))}
            </div>
          ) : (
            <div className="soft-empty">
              No recommendations to show yet. Add interests and a location in
              your profile to tune your picks.
              <Link href="/me#profile">Set your preferences</Link>
            </div>
          )}
        </section>
      )}

      <section className="discovery-section content-wrap" id="events">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Out there, nearby</p>
            <h2>Find your next thing.</h2>
          </div>
          <p className="result-count">
            {loading
              ? 'Looking around…'
              : `${total} ${total === 1 ? 'event' : 'events'} found`}
          </p>
        </div>
        <LocationPicker
          value={{
            stateCode: form.stateCode,
            cityId: form.cityId,
            locality: form.locality,
          }}
          onChange={(location) =>
            setForm((current) => ({ ...current, ...location }))
          }
        />
        <form
          className="filter-bar"
          onSubmit={(event) => {
            event.preventDefault();
            searchEvents(1, form);
          }}
        >
          <label className="search-field">
            <span>Search events</span>
            <input
              value={form.q}
              onChange={(event) => updateField('q', event.target.value)}
              placeholder="Search workshops, concerts…"
              maxLength={200}
            />
          </label>
          <label>
            <span>Category</span>
            <select
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
            >
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
          </label>
          <label>
            <span>Max price</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.maxPrice}
              onChange={(event) => updateField('maxPrice', event.target.value)}
              placeholder="Any"
            />
          </label>
          <details className="location-filter">
            <summary>Distance</summary>
            <div className="location-fields">
              <label>
                <span>Latitude</span>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={form.latitude}
                  onChange={(event) =>
                    updateField('latitude', event.target.value)
                  }
                />
              </label>
              <label>
                <span>Longitude</span>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={form.longitude}
                  onChange={(event) =>
                    updateField('longitude', event.target.value)
                  }
                />
              </label>
              <label>
                <span>Radius · km</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  value={form.radiusKm}
                  onChange={(event) =>
                    updateField('radiusKm', event.target.value)
                  }
                  placeholder="10"
                />
              </label>
              <button
                type="button"
                className="text-button"
                onClick={() => void requestMyLocation()}
              >
                Use my location
              </button>
            </div>
          </details>
          <button className="button button-dark filter-submit">Search</button>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => {
              setForm(initialSearch);
              searchEvents(1, initialSearch);
            }}
          >
            Clear
          </button>
        </form>
        {error && (
          <div className="error-panel" role="alert">
            <div>
              <strong>We couldn’t load events.</strong>
              <p>{error}</p>
            </div>
            <button
              className="button button-outline"
              type="button"
              onClick={() => searchEvents(page, form)}
            >
              Try again
            </button>
          </div>
        )}
        <div className="results-view-toggle" role="group" aria-label="Event results view">
          <button
            className="button button-quiet"
            type="button"
            aria-pressed={resultView === 'list'}
            onClick={() => setResultView('list')}
          >
            List
          </button>
          <button
            className="button button-quiet"
            type="button"
            aria-pressed={resultView === 'map'}
            onClick={() => setResultView('map')}
          >
            Map
          </button>
        </div>
        {error ? null : loading ? (
          <div className="event-grid" aria-label="Loading events">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="event-skeleton" key={index}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : resultView === 'map' ? (
          <EventMap events={events} />
        ) : events.length === 0 ? (
          <div className="empty-panel">
            <span className="empty-mark" aria-hidden="true">
              0
            </span>
            <h3>
              {form.cityId
                ? `No events in ${form.locality || 'this city'} yet.`
                : form.stateCode
                  ? 'No events in this state or territory yet.'
                  : 'No events in this mix. Yet.'}
            </h3>
            <p>
              Try another city, widen the date, clear a filter, or increase your
              radius.
            </p>
            <button
              className="button button-dark"
              type="button"
              onClick={() => {
                setForm(initialSearch);
                searchEvents(1, initialSearch);
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} session={session} />
            ))}
          </div>
        )}
        {total > 12 && (
          <div className="pagination-row">
            <button
              className="button button-outline"
              disabled={page <= 1 || loading}
              onClick={() => searchEvents(page - 1, form)}
            >
              Previous
            </button>
            <span>
              Page {page} · {total} events
            </span>
            <button
              className="button button-outline"
              disabled={page * 12 >= total || loading}
              onClick={() => searchEvents(page + 1, form)}
            >
              More events
            </button>
          </div>
        )}
      </section>
    </>
  );
}
