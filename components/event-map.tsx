'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  formatEventDate,
  type EventRecord,
} from '@/lib/client/api';

const DEFAULT_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export function EventMap({
  events,
  mapStyleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL,
}: {
  events: EventRecord[];
  mapStyleUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const locatedEvents = useMemo(
    () =>
      events.filter(
        (event) => event.latitude !== null && event.longitude !== null,
      ),
    [events],
  );

  useEffect(() => {
    if (!containerRef.current || locatedEvents.length === 0) return;

    let disposed = false;
    let map: import('maplibre-gl').Map | undefined;
    setError('');

    void import('maplibre-gl')
      .then(({ LngLatBounds, Map, Marker, NavigationControl, Popup }) => {
        if (disposed || !containerRef.current) return;

        map = new Map({
          container: containerRef.current,
          style: mapStyleUrl,
          center: [locatedEvents[0].longitude!, locatedEvents[0].latitude!],
          zoom: locatedEvents.length === 1 ? 12 : 10,
        });
        map.addControl(new NavigationControl(), 'top-right');

        const bounds = new LngLatBounds();

        for (const event of locatedEvents) {
          const longitude = event.longitude!;
          const latitude = event.latitude!;
          bounds.extend([longitude, latitude]);

          const markerButton = document.createElement('button');
          markerButton.type = 'button';
          markerButton.className = 'event-map-marker';
          markerButton.setAttribute('aria-label', `View ${event.title}`);
          markerButton.textContent = '•';

          const popupContent = document.createElement('div');
          popupContent.className = 'event-map-popup';
          const title = document.createElement('strong');
          title.textContent = event.title;
          const date = document.createElement('span');
          date.textContent = formatEventDate(event.start_at);
          const link = document.createElement('a');
          link.href = `/events/${encodeURIComponent(event.id)}`;
          link.textContent = 'View event';
          popupContent.append(title, date, link);

          new Marker({ element: markerButton })
            .setLngLat([longitude, latitude])
            .setPopup(new Popup({ offset: 18 }).setDOMContent(popupContent))
            .addTo(map);
        }

        if (locatedEvents.length > 1) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 13 });
        }

        map.on('error', () => {
          map?.remove();
          map = undefined;
          setError('The map could not load. Use the event list instead.');
        });
      })
      .catch(() => {
        if (!disposed) {
          setError('The map could not load. Use the event list instead.');
        }
      });

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [locatedEvents, mapStyleUrl]);

  if (events.length === 0) {
    return (
      <p className="map-message" role="status">
        Search for events to see them on the map.
      </p>
    );
  }

  if (locatedEvents.length === 0) {
    return (
      <p className="map-message" role="status">
        These events do not include map coordinates. The event list is still
        available.
      </p>
    );
  }

  if (error) {
    return (
      <p className="map-message" role="status">
        {error}
      </p>
    );
  }

  return (
    <div
      className="event-map"
      ref={containerRef}
      aria-label="Map of published events"
    />
  );
}
