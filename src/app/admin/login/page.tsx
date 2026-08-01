'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { isAdminAuthed, setAdminAuthed } from '@/components/admin/auth';
import { Button, Field, Input } from '@/components/admin/ui';
import { SITE } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@vanguard.studio');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) router.replace('/admin');
  }, [router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Temporary local gate — wire to Django session/JWT later.
    if (email.trim() && password.trim().length >= 4) {
      setAdminAuthed(true);
      router.replace('/admin');
      return;
    }

    setLoading(false);
    setError('Enter a valid email and password (min 4 characters).');
  };

  return (
    <div data-admin className="admin-login">
      <div className="admin-card admin-login__card">
        <div className="admin-login__brand">
          <Image src={SITE.logo} alt={SITE.name} width={140} height={18} />
        </div>
        <h1 className="admin-page-title" style={{ fontSize: 28 }}>
          Welcome back
        </h1>
        <p className="admin-page-desc">
          Sign in to manage projects, services, blogs, and site content.
        </p>

        <form onSubmit={submit} className="admin-stack" style={{ marginTop: 28 }}>
          <Field label="Email" error={error && !email ? error : undefined}>
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password" error={error || undefined}>
            <div style={{ position: 'relative' }}>
              <Input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={Boolean(error)}
                required
                style={{ paddingRight: 88 }}
              />
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                style={{ position: 'absolute', right: 6, top: 6 }}
                onClick={() => setShow((v) => !v)}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </Field>

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
