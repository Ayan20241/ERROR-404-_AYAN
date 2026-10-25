import { Suspense } from 'react';

import { AuthForm } from '@/components/auth-form';

export default function SignInPage() {
  return (
    <section className="auth-page content-wrap">
      <Suspense fallback={<div className="page-loading">Opening sign in…</div>}>
        <AuthForm mode="signin" />
      </Suspense>
    </section>
  );
}
