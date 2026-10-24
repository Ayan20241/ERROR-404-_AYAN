'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiRequest, type SessionResponse } from '@/lib/client/api';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void apiRequest<SessionResponse>('/api/auth/session')
      .then(setSession)
      .catch(() => setSession({ user: null, role: null }));
  }, []);

  async function signOut() {
    try {
      await apiRequest('/api/auth/signout', { method: 'POST' });
      setSession({ user: null, role: null });
      router.push('/');
    } catch {
      setMenuOpen(false);
      window.dispatchEvent(
        new CustomEvent('app-message', {
          detail: 'Sign out could not be completed. Please try again.',
        }),
      );
    }
  }

  const role = session?.role;

  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Link
            className="wordmark"
            href="/"
            aria-label="Hyperlocal Events home"
          >
            <span className="wordmark-dot" aria-hidden="true" />
            hyperlocal
            <span className="wordmark-small">events</span>
          </Link>
          <nav aria-label="Main navigation" className="desktop-nav">
            <Link href="/">Discover</Link>
            {session?.user && (
              <>
                {role === 'attendee' && <Link href="/me">My events</Link>}
                {role === 'organizer' && (
                  <Link href="/organizer">Organizer</Link>
                )}
                {role === 'admin' && <Link href="/admin">Moderation</Link>}
              </>
            )}
          </nav>
          <div className="nav-actions">
            {session?.user ? (
              <div className="account-menu">
                <button
                  className="account-trigger"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <span className="avatar" aria-hidden="true">
                    {(session.user.email?.[0] ?? 'A').toUpperCase()}
                  </span>
                  <span className="account-label">
                    {role === 'admin' ? 'Admin' : (role ?? 'Account')}
                  </span>
                </button>
                {menuOpen && (
                  <div className="account-popover">
                    {role === 'attendee' && (
                      <>
                        <Link href="/me" onClick={() => setMenuOpen(false)}>
                          My space
                        </Link>
                        <Link
                          href="/me#profile"
                          onClick={() => setMenuOpen(false)}
                        >
                          Profile & preferences
                        </Link>
                      </>
                    )}
                    <button type="button" onClick={() => void signOut()}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link className="button button-dark nav-login" href="/signin">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Link className="wordmark wordmark-light" href="/">
            <span className="wordmark-dot" aria-hidden="true" />
            hyperlocal <span className="wordmark-small">events</span>
          </Link>
          <p>Find your people. Find your next thing.</p>
        </div>
      </footer>
    </>
  );
}
