import { z } from 'zod';

export const phase5EventIdSchema = z.uuid();

export const notificationQuerySchema = z.object({
  unread: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const recommendationQuerySchema = z
  .object({
    lat: z.coerce.number().finite().min(-90).max(90).optional(),
    lng: z.coerce.number().finite().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().finite().positive().max(500).optional(),
    stateCode: z
      .string()
      .regex(/^IN-[A-Z]{2}$/)
      .optional(),
    cityId: z
      .string()
      .regex(/^IN-[A-Z]{2}-[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
      .optional(),
    locality: z.string().trim().min(1).max(120).optional(),
  })
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
  );

export const feedbackSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  })
  .strict();

export const attendanceSchema = z
  .object({
    attendeeId: z.uuid(),
    attendanceStatus: z.enum(['attended', 'no_show']),
  })
  .strict();
