'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Button, Field, Input } from '@/components/admin/ui';
import { SITE } from '@/lib/constants';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          detail?: string;
        };
        setError(data.detail ?? 'Invalid username or password.');
        setLoading(false);
        return;
      }

      // Full navigation so middleware re-reads the new session cookie.
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next?.startsWith('/') ? next : '/admin';
    } catch {
      setError('Could not reach the server. Try again.');
      setLoading(false);
    }
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
          <Field label="Username">
            <Input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              invalid={Boolean(error)}
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
