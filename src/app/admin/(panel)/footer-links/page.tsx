'use client';

import { useEffect, useState } from 'react';

import { IconPlus, IconTrash } from '@/components/admin/icons';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  SkeletonRows,
  Toast,
} from '@/components/admin/ui';
import {
  getAdminFooter,
  saveAdminFooter,
  type AdminFooterData,
  type AdminOffice,
  type AdminSocial,
} from '@/lib/admin-api';

export default function AdminFooterLinksPage() {
  const [data, setData] = useState<AdminFooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const footer = await getAdminFooter();
        if (alive) setData(footer);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Could not load footer.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const saved = await saveAdminFooter(data);
      setData(saved);
      setToast('Footer saved — live site updated.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not save footer.');
    } finally {
      setSaving(false);
    }
  };

  const updateOffice = (index: number, patch: Partial<AdminOffice>) => {
    setData((prev) => {
      if (!prev) return prev;
      const offices = prev.offices.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      );
      return { ...prev, offices };
    });
  };

  const updateSocial = (index: number, patch: Partial<AdminSocial>) => {
    setData((prev) => {
      if (!prev) return prev;
      const social = prev.social.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      );
      return { ...prev, social };
    });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Footer links" description="Loading…" />
        <SkeletonRows rows={4} />
      </>
    );
  }

  if (!data) {
    return (
      <PageHeader
        title="Footer links"
        description={error || 'Could not load footer data from Django.'}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Footer links"
        description="Offices and social links shown in the site footer."
        actions={
          <Button disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save footer'}
          </Button>
        }
      />

      <div className="admin-stack">
        <Card>
          <div className="admin-form-section">
            <h2 className="admin-form-section__title">Contact</h2>
            <Field label="Contact email">
              <Input
                type="email"
                value={data.contactEmail}
                onChange={(e) =>
                  setData((prev) =>
                    prev ? { ...prev, contactEmail: e.target.value } : prev,
                  )
                }
              />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="admin-form-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <h2 className="admin-form-section__title">Offices</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setData((prev) =>
                    prev
                      ? {
                          ...prev,
                          offices: [
                            ...prev.offices,
                            {
                              order: prev.offices.length,
                              city: '',
                              address: '',
                              phone: '',
                              enabled: true,
                            },
                          ],
                        }
                      : prev,
                  )
                }
              >
                <IconPlus /> Add office
              </Button>
            </div>
            {data.offices.map((office, index) => (
              <div
                key={office.id ?? `office-${index}`}
                className="admin-card"
                style={{ padding: 16, background: '#faf9f7' }}
              >
                <div className="admin-stack">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                    }}
                  >
                    <Field label="City">
                      <Input
                        value={office.city}
                        onChange={(e) =>
                          updateOffice(index, { city: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        value={office.phone}
                        onChange={(e) =>
                          updateOffice(index, { phone: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Address">
                    <Input
                      value={office.address}
                      onChange={(e) =>
                        updateOffice(index, { address: e.target.value })
                      }
                    />
                  </Field>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <label className="admin-switch">
                      <input
                        type="checkbox"
                        checked={office.enabled}
                        onChange={(e) =>
                          updateOffice(index, { enabled: e.target.checked })
                        }
                      />
                      <span className="admin-switch__track" />
                      <span className="admin-switch__label">
                        {office.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setData((prev) =>
                          prev
                            ? {
                                ...prev,
                                offices: prev.offices.filter((_, i) => i !== index),
                              }
                            : prev,
                        )
                      }
                    >
                      <IconTrash /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="admin-form-section">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <h2 className="admin-form-section__title">Social links</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setData((prev) =>
                    prev
                      ? {
                          ...prev,
                          social: [
                            ...prev.social,
                            {
                              order: prev.social.length,
                              label: '',
                              url: 'https://',
                              enabled: true,
                              openInNewTab: true,
                            },
                          ],
                        }
                      : prev,
                  )
                }
              >
                <IconPlus /> Add link
              </Button>
            </div>
            {data.social.map((link, index) => (
              <div
                key={link.id ?? `social-${index}`}
                className="admin-card"
                style={{ padding: 16, background: '#faf9f7' }}
              >
                <div className="admin-stack">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.4fr',
                      gap: 12,
                    }}
                  >
                    <Field label="Label">
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateSocial(index, { label: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="URL">
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateSocial(index, { url: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16 }}>
                      <Badge tone={link.enabled ? 'success' : 'neutral'}>
                        {link.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <label className="admin-help">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) =>
                            updateSocial(index, { enabled: e.target.checked })
                          }
                        />{' '}
                        Show in footer
                      </label>
                      <label className="admin-help">
                        <input
                          type="checkbox"
                          checked={link.openInNewTab}
                          onChange={(e) =>
                            updateSocial(index, {
                              openInNewTab: e.target.checked,
                            })
                          }
                        />{' '}
                        New tab
                      </label>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setData((prev) =>
                          prev
                            ? {
                                ...prev,
                                social: prev.social.filter((_, i) => i !== index),
                              }
                            : prev,
                        )
                      }
                    >
                      <IconTrash /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
