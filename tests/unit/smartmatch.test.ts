import { describe, expect, it } from 'vitest';

import { haversineDistanceKm } from '@/lib/geo/haversine';
import { scoreEvent } from '@/lib/smartmatch/score';

const now = new Date('2026-10-24T00:00:00.000Z');
const event = {
  id: 'event-1',
  title: 'Local technology meetup',
  category: 'Technology',
  status: 'published',
  start_at: '2026-10-30T00:00:00.000Z',
  end_at: '2026-10-30T02:00:00.000Z',
  registration_deadline: '2026-10-29T00:00:00.000Z',
  price: 20,
  capacity: 50,
  registered_count: 10,
  latitude: 40,
  longitude: -74,
};
const preferences = {
  interests: ['Technology'],
  preferred_categories: ['Technology'],
  preferred_budget: 50,
  preferred_latitude: 40,
  preferred_longitude: -74,
  preferred_radius_km: 10,
};

describe('SmartMatch scoring and eligibility', () => {
  it('scores matching, nearby, affordable events deterministically', () => {
    const first = scoreEvent(event, preferences, now);
    const second = scoreEvent(event, preferences, now);

    expect(first).toEqual(second);
    expect(first?.score).toBeGreaterThanOrEqual(90);
    expect(first?.reasons).toContain('Matches your interest in Technology.');
    expect(first?.reasons).toContain('Fits your preferred budget.');
    expect(first?.distanceKm).toBe(0);
  });

  it.each([
    { status: 'draft' },
    { end_at: '2026-10-23T23:59:59.000Z' },
    { registration_deadline: '2026-10-23T23:59:59.000Z' },
    { registered_count: 50 },
  ])('excludes ineligible events: %o', (change) => {
    expect(scoreEvent({ ...event, ...change }, preferences, now)).toBeNull();
  });

  it('excludes events outside the preference radius', () => {
    expect(
      scoreEvent({ ...event, longitude: -73 }, preferences, now),
    ).toBeNull();
  });

  it('uses neutral proximity without coordinates', () => {
    const result = scoreEvent(
      { ...event, latitude: null, longitude: null },
      { ...preferences, preferred_latitude: null, preferred_longitude: null },
      now,
    );

    expect(result?.distanceKm).toBeNull();
    expect(result?.reasons.some((reason) => reason.includes('km'))).toBe(false);
  });

  it('explains the actual price relation when an event is over budget', () => {
    const result = scoreEvent(
      { ...event, price: 60 },
      { ...preferences, preferred_budget: 50 },
      now,
    );

    expect(result?.reasons).toContain(
      'Costs 60, above your preferred budget of 50.',
    );
    expect(result?.reasons).not.toContain('Fits your preferred budget.');
  });

  it('computes known and zero-distance Haversine cases', () => {
    expect(
      haversineDistanceKm(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ),
    ).toBeCloseTo(111.19, 1);
    expect(
      haversineDistanceKm(
        { latitude: 1, longitude: 2 },
        { latitude: 1, longitude: 2 },
      ),
    ).toBe(0);
  });
});
