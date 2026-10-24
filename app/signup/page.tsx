import { Suspense } from 'react';

import { AuthForm } from '@/components/auth-form';

export default function SignUpPage() {
  return (
    <section className="auth-page content-wrap">
      <Suspense fallback={<div className="page-loading">Opening sign up…</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </section>
  );
}
