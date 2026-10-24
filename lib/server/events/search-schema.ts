import { z } from 'zod';

export const EVENT_CATEGORIES = [
  'Technology',
  'Music',
  'Food & Drink',
  'Sports & Fitness',
  'Arts & Culture',
  'Business & Networking',
  'Education & Workshops',
  'Community',
  'Health & Wellness',
  'Other',
] as const;

const dateTimeSchema = z.iso.datetime({ offset: true });

export const eventSearchQueryFieldsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  category: z.enum(EVENT_CATEGORIES).optional(),
  dateFrom: dateTimeSchema.optional(),
  dateTo: dateTimeSchema.optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional(),
  lat: z.coerce.number().finite().min(-90).max(90).optional(),
  lng: z.coerce.number().finite().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().finite().positive().optional(),
  stateCode: z
    .string()
    .regex(/^IN-[A-Z]{2}$/)
    .optional(),
  cityId: z
    .string()
    .regex(/^IN-[A-Z]{2}-[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
    .optional(),
  locality: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export const eventSearchQuerySchema = eventSearchQueryFieldsSchema
  .refine(
    (query) =>
      (query.lat === undefined && query.lng === undefined) ||
      (query.lat !== undefined && query.lng !== undefined),
    { message: 'Latitude and longitude must be provided together.' },
  )
  .refine(
    (query) =>
      query.radiusKm === undefined ||
      (query.lat !== undefined && query.lng !== undefined),
    { message: 'Radius filtering requires latitude and longitude.' },
  )
  .refine(
    (query) =>
      (query.cityId === undefined && query.locality === undefined) ||
      query.stateCode !== undefined,
    { message: 'City and locality filters require a state or territory.' },
  )
  .refine(
    (query) => query.locality === undefined || query.cityId !== undefined,
    { message: 'Locality filtering requires a city.' },
  )
  .refine(
    (query) =>
      query.dateFrom === undefined ||
      query.dateTo === undefined ||
      Date.parse(query.dateFrom) <= Date.parse(query.dateTo),
    { message: 'dateFrom must not be after dateTo.' },
  );

export type EventSearchQuery = z.output<typeof eventSearchQuerySchema>;
