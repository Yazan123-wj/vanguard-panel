'use client';

import { useEffect, useId, useState } from 'react';

import { IconPlus } from '@/components/admin/icons';
import {
  Button,
  Dialog,
  Field,
  Input,
  Textarea,
} from '@/components/admin/ui';
import {
  createAdminService,
  type AdminServiceRecord,
  type ContentStatus,
} from '@/lib/admin-api';

type Draft = {
  name: string;
  description: string;
  tags: string[];
  tagInput: string;
  status: ContentStatus;
  showOnHomepage: boolean;
};

const emptyDraft = (): Draft => ({
  name: '',
  description: '',
  tags: [],
  tagInput: '',
  status: 'draft',
  showOnHomepage: true,
});

type Props = {
  open: boolean;
  nextOrder: number;
  onClose: () => void;
  onCreated: (service: AdminServiceRecord, continueEditing: boolean) => void;
};

export function AddServiceModal({
  open,
  nextOrder,
  onClose,
  onCreated,
}: Props) {
  const nameId = useId();
  const [draft, setDraft] = useState(() => emptyDraft());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(emptyDraft());
    setError('');
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const addTag = () => {
    const value = draft.tagInput.trim();
    if (!value || draft.tags.includes(value)) {
      setDraft((prev) => ({ ...prev, tagInput: '' }));
      return;
    }
    setDraft((prev) => ({
      ...prev,
      tags: [...prev.tags, value],
      tagInput: '',
    }));
  };

  const create = async (continueEditing: boolean) => {
    if (!draft.name.trim()) {
      setError('Give the service a name to continue.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await createAdminService({
        name: draft.name.trim(),
        description: draft.description.trim(),
        tags: draft.tags,
        status: draft.status,
        // Homepage shows the first 4 by order; keep that automatic.
        order: draft.showOnHomepage
          ? Math.min(nextOrder, 4)
          : Math.max(nextOrder, 5),
        defineItems: [],
        workSteps: [],
        leaveWith: [],
      });
      onCreated(created, continueEditing);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create service. Is Django on :8001?',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      size="lg"
      title="Add service"
      description="Creates a real service in Django — published ones appear on the site."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <div className="admin-dialog__footer-right">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => void create(true)}
            >
              Create & edit details
            </Button>
            <Button disabled={saving} onClick={() => void create(false)}>
              <IconPlus />
              {saving ? 'Creating…' : 'Create service'}
            </Button>
          </div>
        </>
      }
    >
      <div className="admin-add-service">
        {error ? (
          <p className="admin-help" style={{ color: 'var(--admin-error)' }}>
            {error}
          </p>
        ) : null}
        <div className="admin-add-service__hero">
          <Field label="Service name">
            <Input
              id={nameId}
              autoFocus
              value={draft.name}
              onChange={(e) => {
                setError('');
                setDraft((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="e.g. Brand Strategy"
              invalid={Boolean(error)}
            />
          </Field>
          <Field label="Short description">
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              placeholder="What this service helps clients achieve…"
            />
          </Field>
        </div>

        <label className="admin-add-service__check">
          <input
            type="checkbox"
            checked={draft.status === 'published'}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                status: e.target.checked ? 'published' : 'draft',
              }))
            }
          />
          <span>
            <strong>Show on website</strong>
            <small>Published services appear on /services</small>
          </span>
        </label>

        <label className="admin-add-service__check">
          <input
            type="checkbox"
            checked={draft.showOnHomepage}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                showOnHomepage: e.target.checked,
              }))
            }
          />
          <span>
            <strong>Eligible for homepage</strong>
            <span className="admin-help">
              First 4 published services appear in the homepage stack.
            </span>
          </span>
        </label>

        <Field label="Tags">
          <div className="admin-add-service__tags-row">
            <Input
              value={draft.tagInput}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, tagInput: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Research, Positioning…"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
          {draft.tags.length > 0 ? (
            <div className="admin-tags" style={{ marginTop: 10 }}>
              {draft.tags.map((tag) => (
                <span key={tag} className="admin-chip">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((t) => t !== tag),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </Field>
      </div>
    </Dialog>
  );
}
