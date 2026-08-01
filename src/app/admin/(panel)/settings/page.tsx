'use client';

import { useState } from 'react';

import { Button, Card, Field, Input, PageHeader, Toast } from '@/components/admin/ui';

export default function AdminSettingsPage() {
  const [name, setName] = useState('Admin');
  const [email, setEmail] = useState('admin@vanguard.studio');
  const [toast, setToast] = useState('');

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your admin profile and workspace preferences."
      />

      <div className="admin-stack" style={{ maxWidth: 560 }}>
        <Card>
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Admin profile</h2>
            <Field label="Display name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button
              onClick={() => setToast('Profile updated successfully.')}
              style={{ alignSelf: 'flex-start' }}
            >
              Save profile
            </Button>
          </div>
        </Card>

        <Card>
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Password</h2>
            <Field label="Current password">
              <Input type="password" autoComplete="current-password" />
            </Field>
            <Field label="New password">
              <Input type="password" autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password">
              <Input type="password" autoComplete="new-password" />
            </Field>
            <Button
              onClick={() => setToast('Password change saved.')}
              style={{ alignSelf: 'flex-start' }}
            >
              Update password
            </Button>
          </div>
        </Card>

        <Card>
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Workspace preferences</h2>
            <label className="admin-field" style={{ flexDirection: 'row', gap: 10 }}>
              <input type="checkbox" defaultChecked />
              <span className="admin-label">Show toast confirmations after save</span>
            </label>
            <label className="admin-field" style={{ flexDirection: 'row', gap: 10 }}>
              <input type="checkbox" defaultChecked />
              <span className="admin-label">Warn before deleting published content</span>
            </label>
            <Button
              onClick={() => setToast('Preferences saved.')}
              style={{ alignSelf: 'flex-start' }}
            >
              Save preferences
            </Button>
          </div>
        </Card>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
