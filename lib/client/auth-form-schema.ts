import { z } from 'zod';

export const authFormSchema = z.object({
  email: z.string().trim().pipe(z.email().max(320)),
  password: z.string().min(1).max(128),
  displayName: z.string().trim().min(1).max(80).optional(),
});
