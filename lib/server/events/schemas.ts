import { z } from 'zod';

import { EVENT_CATEGORIES } from '@/lib/server/events/search-schema';

const dateTimeSchema = z.iso.datetime({ offset: true });
const coordinateSchema = z.number().finite();

const eventFields = {
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(EVENT_CATEGORIES),
  venue_name: z.string().trim().max(160).nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  latitude: coordinateSchema.min(-90).max(90).nullable().optional(),
  longitude: coordinateSchema.min(-180).max(180).nullable().optional(),
  start_at: dateTimeSchema,
  end_at: dateTimeSchema,
  price: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  capacity: z.number().int().positive(),
  registration_deadline: dateTimeSchema.nullable().optional(),
  image_url: z
    .url({ protocol: /^https$/ })
    .max(2048)
    .nullable()
    .optional(),
  locality: z.string().trim().max(120).nullable().optional(),
};

function hasCoordinatePair(value: {
  latitude?: number | null;
  longitude?: number | null;
}): boolean {
  return (
    (value.latitude === undefined && value.longitude === undefined) ||
    (value.latitude != null && value.longitude != null) ||
    (value.latitude === null && value.longitude === null)
  );
}

export const createEventSchema = z
  .object({
    ...eventFields,
    venue_name: z.string().trim().min(1).max(160),
    address: z.string().trim().min(1).max(500),
    country_code: z.literal('IN').default('IN'),
    state_code: z.string().regex(/^IN-[A-Z]{2}$/),
    city_id: z.string().regex(/^IN-[A-Z]{2}-[A-Z0-9]+(?:-[A-Z0-9]+)*$/),
    price: eventFields.price.default(0),
    currency: eventFields.currency.default('INR'),
    publish: z.boolean().default(false),
  })
  .strict()
  .refine((value) => Date.parse(value.end_at) > Date.parse(value.start_at), {
    message: 'End time must be after start time.',
  })
  .refine(hasCoordinatePair, {
    message: 'Latitude and longitude must be provided together.',
  })
  .refine((value) => value.city_id.startsWith(`${value.state_code}-`), {
    message: 'The selected city does not belong to that state or territory.',
  });

export const updateEventSchema = z
  .object({
    title: eventFields.title.optional(),
    description: eventFields.description.optional(),
    category: eventFields.category.optional(),
    venue_name: eventFields.venue_name,
    address: eventFields.address,
    latitude: eventFields.latitude,
    longitude: eventFields.longitude,
    start_at: eventFields.start_at.optional(),
    end_at: eventFields.end_at.optional(),
    price: eventFields.price.optional(),
    currency: eventFields.currency.optional(),
    capacity: eventFields.capacity.optional(),
    registration_deadline: eventFields.registration_deadline,
    image_url: eventFields.image_url,
    state_code: z
      .string()
      .regex(/^IN-[A-Z]{2}$/)
      .optional(),
    city_id: z
      .string()
      .regex(/^IN-[A-Z]{2}-[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
      .optional(),
    locality: eventFields.locality,
    publish: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one event field must be provided.',
  })
  .refine(hasCoordinatePair, {
    message: 'Latitude and longitude must be provided together.',
  })
  .refine(
    (value) =>
      value.state_code === undefined ||
      (value.city_id !== undefined &&
        value.city_id.startsWith(`${value.state_code}-`)),
    {
      message: 'Choose a city that belongs to the selected state or territory.',
    },
  )
  .refine(
    (value) =>
      value.publish !== true ||
      (!!value.state_code &&
        !!value.city_id &&
        typeof value.venue_name === 'string' &&
        value.venue_name.trim().length > 0 &&
        typeof value.address === 'string' &&
        value.address.trim().length > 0),
    { message: 'Publishing requires a valid state, city, venue, and address.' },
  );

export const eventIdSchema = z.uuid();

export const profilePatchSchema = z
  .object({
    display_name: z.string().trim().min(1).max(80).nullable().optional(),
    interests: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
    preferred_categories: z.array(z.enum(EVENT_CATEGORIES)).max(10).optional(),
    preferred_budget: z.number().finite().nonnegative().nullable().optional(),
    preferred_location_label: z.string().trim().max(120).nullable().optional(),
    preferred_latitude: coordinateSchema.min(-90).max(90).nullable().optional(),
    preferred_longitude: coordinateSchema
      .min(-180)
      .max(180)
      .nullable()
      .optional(),
    preferred_radius_km: z.number().finite().positive().max(500).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field must be provided.',
  })
  .refine(
    (value) =>
      (value.preferred_latitude === undefined &&
        value.preferred_longitude === undefined) ||
      (value.preferred_latitude != null && value.preferred_longitude != null) ||
      (value.preferred_latitude === null && value.preferred_longitude === null),
    {
      message: 'Preferred latitude and longitude must be provided together.',
    },
  );
