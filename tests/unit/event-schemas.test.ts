import { describe, expect, it } from 'vitest';

import {
  createEventSchema,
  profilePatchSchema,
  updateEventSchema,
} from '@/lib/server/events/schemas';
import { eventSearchQuerySchema } from '@/lib/server/events/search-schema';
import {
  attendanceSchema,
  feedbackSchema,
  recommendationQuerySchema,
} from '@/lib/server/phase5/schemas';

const validEvent = {
  title: 'Local workshop',
  description: 'A community workshop.',
  category: 'Technology',
  start_at: '2027-01-01T10:00:00Z',
  end_at: '2027-01-01T11:00:00Z',
  capacity: 20,
  venue_name: 'Community Hall',
  address: '12 Market Road, Bengaluru',
  state_code: 'IN-KA',
  city_id: 'IN-KA-BENGALURU',
};

describe('core API schemas', () => {
  it('defaults new events to drafts and rejects client-controlled fields', () => {
    expect(createEventSchema.parse(validEvent)).toMatchObject({
      publish: false,
      price: 0,
      currency: 'INR',
      country_code: 'IN',
    });
    expect(
      createEventSchema.safeParse({ ...validEvent, organizer_id: 'other-user' })
        .success,
    ).toBe(false);
  });

  it('requires event time and coordinates to be internally consistent', () => {
    expect(
      createEventSchema.safeParse({
        ...validEvent,
        start_at: '2027-01-01T11:00:00Z',
        end_at: '2027-01-01T10:00:00Z',
      }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({ ...validEvent, latitude: 10 }).success,
    ).toBe(false);
    expect(
      createEventSchema.safeParse({
        ...validEvent,
        image_url: 'http://example.test/image.jpg',
      }).success,
    ).toBe(false);
    expect(
      eventSearchQuerySchema.safeParse({
        stateCode: 'IN-KA',
        cityId: 'IN-KA-BENGALURU',
        locality: 'Indiranagar',
      }).success,
    ).toBe(true);
    expect(
      eventSearchQuerySchema.safeParse({
        cityId: 'IN-KA-BENGALURU',
      }).success,
    ).toBe(false);
    expect(
      eventSearchQuerySchema.safeParse({
        stateCode: 'IN-KA',
        locality: 'Indiranagar',
      }).success,
    ).toBe(false);
  });

  it('does not accept role changes through profile preferences', () => {
    expect(
      profilePatchSchema.safeParse({ display_name: 'Attendee', role: 'admin' })
        .success,
    ).toBe(false);
    expect(
      profilePatchSchema.safeParse({
        preferred_latitude: 10,
        preferred_longitude: 20,
      }).success,
    ).toBe(true);
    expect(
      profilePatchSchema.safeParse({ preferred_latitude: 10 }).success,
    ).toBe(false);
  });

  it('requires paired coordinates and ordered date filters for discovery', () => {
    expect(
      eventSearchQuerySchema.safeParse({ lat: '10', lng: '20' }).success,
    ).toBe(true);
    expect(
      eventSearchQuerySchema.safeParse({ lat: '10', radiusKm: '5' }).success,
    ).toBe(false);
    expect(
      eventSearchQuerySchema.safeParse({
        dateFrom: '2027-01-02T00:00:00Z',
        dateTo: '2027-01-01T00:00:00Z',
      }).success,
    ).toBe(false);
  });

  it('requires event changes to contain at least one editable property', () => {
    expect(updateEventSchema.safeParse({}).success).toBe(false);
    expect(updateEventSchema.safeParse({ publish: true }).success).toBe(false);
    expect(
      updateEventSchema.safeParse({
        publish: true,
        state_code: 'IN-KA',
        city_id: 'IN-KA-BENGALURU',
        venue_name: 'Community Hall',
        address: '12 Market Road',
      }).success,
    ).toBe(true);
    expect(
      updateEventSchema.safeParse({
        state_code: 'IN-MH',
        city_id: 'IN-KA-BENGALURU',
      }).success,
    ).toBe(false);
    expect(updateEventSchema.safeParse({ status: 'cancelled' }).success).toBe(
      false,
    );
    expect(updateEventSchema.safeParse({ title: 'Legacy event' }).success).toBe(
      true,
    );
  });

  it('validates feedback, attendance, and recommendation overrides', () => {
    expect(
      feedbackSchema.safeParse({ rating: 5, comment: 'Great.' }).success,
    ).toBe(true);
    expect(feedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(
      attendanceSchema.safeParse({
        attendeeId: 'c483d270-d9a8-4ae4-a695-c182ec7769ad',
        attendanceStatus: 'attended',
      }).success,
    ).toBe(true);
    expect(
      attendanceSchema.safeParse({
        attendeeId: 'c483d270-d9a8-4ae4-a695-c182ec7769ad',
        attendanceStatus: 'unknown',
      }).success,
    ).toBe(false);
    expect(
      recommendationQuerySchema.safeParse({ lat: '40', lng: '-74' }).success,
    ).toBe(true);
    expect(recommendationQuerySchema.safeParse({ lat: '40' }).success).toBe(
      false,
    );
  });
});
