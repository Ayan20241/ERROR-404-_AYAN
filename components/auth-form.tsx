'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { apiRequest } from '@/lib/client/api';
import { authFormSchema } from '@/lib/client/auth-form-schema';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === 'signup';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    const input = authFormSchema.safeParse({
      email,
      password,
      ...(isSignup ? { displayName } : {}),
    });
    if (!input.success) {
      setError(
        input.error.issues[0]?.message ??
          'Check the information and try again.',
      );
      return;
    }

    setBusy(true);
    try {
      const result = await apiRequest<{
        authenticated?: boolean;
      }>(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(input.data),
      });
      if (isSignup && result.authenticated === false) {
        setNotice('Check your email to confirm your account, then sign in.');
        return;
      }
      const next = searchParams.get('next');
      router.replace(
        next?.startsWith('/') && !next.startsWith('//') ? next : '/me',
      );
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Authentication could not be completed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">
        {isSignup ? 'Your city, closer' : 'Good to see you'}
      </p>
      <h1>{isSignup ? 'Join your local scene.' : 'Welcome back.'}</h1>
      <p className="muted">
        {isSignup
          ? 'Create an account to save events and keep your plans together.'
          : 'Sign in to pick up where your next great plan begins.'}
      </p>
      <form className="form-stack" onSubmit={submit} noValidate>
        {isSignup && (
          <label>
            Name
            <input
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={80}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={320}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={128}
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="form-success" role="status">
            {notice}
          </p>
        )}
        <button className="button button-dark button-wide" disabled={busy}>
          {busy ? 'One moment…' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="auth-switch">
        {isSignup ? 'Already have an account?' : 'New around here?'}{' '}
        <Link href={isSignup ? '/signin' : '/signup'}>
          {isSignup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </section>
  );
}
