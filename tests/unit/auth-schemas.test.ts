import { describe, expect, it } from 'vitest';

import { signInSchema, signUpSchema } from '@/lib/server/auth/schemas';

describe('authentication input schemas', () => {
  it('accepts valid sign-up input and trims the display name', () => {
    expect(
      signUpSchema.parse({
        email: 'person@example.com',
        password: 'long-enough-password',
        displayName: '  Person  ',
      }),
    ).toEqual({
      email: 'person@example.com',
      password: 'long-enough-password',
      displayName: 'Person',
    });
  });

  it('rejects invalid email, missing passwords, and role fields', () => {
    expect(
      signUpSchema.safeParse({
        email: 'not-an-email',
        password: '',
        role: 'admin',
      }).success,
    ).toBe(false);
    expect(
      signInSchema.safeParse({
        email: 'person@example.com',
        password: 'password',
        role: 'admin',
      }).success,
    ).toBe(false);
  });

  it('accepts valid sign-in input only', () => {
    expect(
      signInSchema.safeParse({
        email: 'person@example.com',
        password: 'password',
      }).success,
    ).toBe(true);
  });
});
