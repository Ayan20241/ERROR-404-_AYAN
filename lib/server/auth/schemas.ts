import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z.email().trim().max(320),
    password: z.string().min(1).max(128),
    displayName: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export const signInSchema = z
  .object({
    email: z.email().trim().max(320),
    password: z.string().min(1).max(128),
  })
  .strict();
