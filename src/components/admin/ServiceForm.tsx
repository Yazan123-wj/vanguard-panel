'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { AdminService } from '@/components/admin/data/mock';
import { IconGrip, IconPlus, IconTrash } from '@/components/admin/icons';
import {
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  Modal,
  Switch,
  Textarea,
  Toast,
} from '@/components/admin/ui';
import {
  createAdminService,
  deleteAdminService,
  updateAdminService,
} from '@/lib/admin-api';

type Item = { title: string; description: string };

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<AdminService> & { slug?: string };
};

function RepeatableList({
  title,
  items,
  onChange,
  addLabel,
  collapsible = false,
  itemLabel = 'Item',
}: {
  title: string;
  items: Item[];
  onChange: (items: Item[]) => void;
  addLabel: string;
  collapsible?: boolean;
  itemLabel?: string;
}) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp;
    onChange(next);
  };

  return (
    <Card>
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">{title}</h2>
        {items.map((item, index) => {
          const expanded = collapsible ? open[index] !== false : true;
          return (
            <div
              key={index}
              className="admin-card"
              style={{ padding: 16, background: '#faf9f7' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: expanded ? 12 : 0,
                  color: 'var(--admin-muted)',
                  alignItems: 'center',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconGrip /> {itemLabel} {index + 1}
                  {!expanded && item.title ? (
                    <span style={{ color: 'var(--admin-ink)', fontWeight: 550 }}>
                      · {item.title}
                    </span>
                  ) : null}
                </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Move up"
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Move down"
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </Button>
                  {collapsible ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOpen((prev) => ({
                          ...prev,
                          [index]: !(prev[index] !== false),
                        }))
                      }
                    >
                      {expanded ? 'Collapse' : 'Expand'}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChange([
                        ...items.slice(0, index + 1),
                        { ...item },
                        ...items.slice(index + 1),
                      ])
                    }
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(items.filter((_, i) => i !== index))}
                  >
                    <IconTrash /> Remove
                  </Button>
                </div>
              </div>
              {expanded ? (
                <div className="admin-stack">
                  <Input
                    value={item.title}
                    placeholder="Title"
                    onChange={(e) =>
                      onChange(
                        items.map((row, i) =>
                          i === index ? { ...row, title: e.target.value } : row,
                        ),
                      )
                    }
                  />
                  <Textarea
                    value={item.description}
                    placeholder="Description"
                    rows={3}
                    onChange={(e) =>
                      onChange(
                        items.map((row, i) =>
                          i === index
                            ? { ...row, description: e.target.value }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              ) : null}
            </div>
          );
        })}
        <Button
          variant="secondary"
          onClick={() => onChange([...items, { title: '', description: '' }])}
        >
          <IconPlus /> {addLabel}
        </Button>
      </div>
    </Card>
  );
}

export function ServiceForm({ mode, initial }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? initial?.id ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState(initial?.status ?? 'draft');
  const [defineItems, setDefineItems] = useState<Item[]>(
    initial?.defineItems?.length
      ? initial.defineItems
      : [{ title: '', description: '' }],
  );
  const [workSteps, setWorkSteps] = useState<Item[]>(
    initial?.workSteps?.length
      ? initial.workSteps
      : [{ title: '', description: '' }],
  );
  const [leaveWith, setLeaveWith] = useState<Item[]>(
    initial?.leaveWith?.length
      ? initial.leaveWith
      : [{ title: '', description: '' }],
  );
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput('');
  };

  const payload = () => ({
    name: name.trim(),
    description: description.trim(),
    tags,
    status,
    defineItems,
    workSteps,
    leaveWith,
  });

  const save = async (nextStatus = status) => {
    if (!name.trim()) {
      setToast('Service name is required.');
      return;
    }
    setSaving(true);
    try {
      const data = { ...payload(), status: nextStatus };
      if (mode === 'create' || !slug) {
        const created = await createAdminService(data);
        setSlug(created.slug);
        setStatus(created.status);
        setToast(
          created.status === 'published'
            ? 'Service published to the website.'
            : 'Service saved as draft.',
        );
        router.replace(`/admin/services/${created.slug}/edit`);
      } else {
        const updated = await updateAdminService(slug, data);
        setStatus(updated.status);
        setToast(
          updated.status === 'published'
            ? 'Service published to the website.'
            : 'Service saved.',
        );
      }
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : 'Could not save. Is Django running on :8001?',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-form-grid">
        <div className="admin-stack">
          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Basic information</h2>
              <Field label="Service name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Short description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </Card>

          <RepeatableList
            title="What we define"
            items={defineItems}
            onChange={setDefineItems}
            addLabel="Add item"
          />
          <RepeatableList
            title="How we work"
            items={workSteps}
            onChange={setWorkSteps}
            addLabel="Add step"
            collapsible
            itemLabel="Step"
          />
          <RepeatableList
            title="What you leave with"
            items={leaveWith}
            onChange={setLeaveWith}
            addLabel="Add deliverable"
            itemLabel="Deliverable"
          />

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Tags</h2>
              <Field label="Add tag" hint="Press Add to insert a chip. Duplicates are ignored.">
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Research"
                  />
                  <Button variant="secondary" type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>
              </Field>
              <div className="admin-tags">
                {tags.map((tag) => (
                  <span key={tag} className="admin-chip">
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag}`}
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="admin-stack admin-sticky-panel">
          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Publishing</h2>
              <Switch
                checked={status === 'published'}
                onChange={(on) => setStatus(on ? 'published' : 'draft')}
                label="Show on website"
              />
              <p className="admin-help">
                {status === 'published'
                  ? 'Live on the services pages.'
                  : 'Saved privately as a draft.'}
              </p>
              <Button
                disabled={saving}
                onClick={() =>
                  void save(status === 'published' ? 'published' : 'draft')
                }
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              {status !== 'published' ? (
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={() => void save('published')}
                >
                  Save & publish
                </Button>
              ) : null}
              <ButtonLink
                href="/admin/services"
                variant="ghost"
                style={{ width: '100%' }}
              >
                Back to services
              </ButtonLink>
            </div>
          </Card>

          {mode === 'edit' && slug ? (
            <Card>
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">Danger zone</h2>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <IconTrash /> Delete service
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete this service?"
        body="Projects tagged with this service will lose the tag."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            if (slug) await deleteAdminService(slug);
            router.push('/admin/services');
          } catch (error) {
            setConfirmDelete(false);
            setToast(
              error instanceof Error ? error.message : 'Could not delete.',
            );
          }
        }}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
