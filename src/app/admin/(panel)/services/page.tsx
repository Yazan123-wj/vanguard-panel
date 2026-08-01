'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ActionMenu } from '@/components/admin/ActionMenu';
import { AddServiceModal } from '@/components/admin/AddServiceModal';
import { IconPlus, IconSearch, IconTrash } from '@/components/admin/icons';
import {
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  SkeletonRows,
  StatusBadge,
  Toast,
} from '@/components/admin/ui';
import {
  deleteAdminService,
  listAdminServices,
  updateAdminService,
  type AdminServiceRecord,
} from '@/lib/admin-api';

function shownOn(service: AdminServiceRecord) {
  if (service.status !== 'published') return [] as string[];
  const places = ['Services page'];
  if (service.order <= 4) places.unshift('Homepage');
  return places;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminServiceRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const services = await listAdminServices();
      setItems(services);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load services.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const services = useMemo(() => {
    return [...items]
      .filter((service) => {
        const matchesQuery =
          !query.trim() ||
          service.name.toLowerCase().includes(query.toLowerCase()) ||
          service.description.toLowerCase().includes(query.toLowerCase()) ||
          service.tags.some((t) =>
            t.toLowerCase().includes(query.toLowerCase()),
          );
        const matchesStatus = status === 'all' || service.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query, status]);

  const nextOrder = items.reduce((max, s) => Math.max(max, s.order), 0) + 1;

  const removeService = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteAdminService(pendingDelete.slug);
      setItems((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setToast(`“${pendingDelete.name}” deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : 'Could not delete this service.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Services"
        description="Synced with the homepage stack and /services page."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <IconPlus /> Add service
          </Button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <IconSearch className="admin-toolbar__search-icon" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
          />
        </div>
        <div className="admin-toolbar__filters">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </div>

      {loading ? <SkeletonRows rows={5} /> : null}
      {!loading && error ? (
        <EmptyState
          title="Cannot reach the content API"
          description={`${error} Start Django on :8001, then retry.`}
          action={<Button onClick={() => void load()}>Retry</Button>}
        />
      ) : null}
      {!loading && !error && services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create your first service for the homepage stack."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <IconPlus /> Add service
            </Button>
          }
        />
      ) : null}

      {!loading && !error && services.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Tags</th>
                <th>Shown on</th>
                <th>Projects</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div className="admin-cell-title">{service.name}</div>
                    <div className="admin-cell-sub">
                      {service.description.slice(0, 80)}
                      {service.description.length > 80 ? '…' : ''}
                    </div>
                  </td>
                  <td>
                    <div className="admin-tags">
                      {service.tags.map((tag) => (
                        <span key={tag} className="admin-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="admin-tags">
                      {shownOn(service).length === 0 ? (
                        <Badge>Hidden</Badge>
                      ) : (
                        shownOn(service).map((place) => (
                          <Badge
                            key={place}
                            tone={place === 'Homepage' ? 'success' : 'info'}
                          >
                            {place}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{service.projectCount}</td>
                  <td>
                    <StatusBadge status={service.status} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <ButtonLink
                        href={`/admin/services/${service.slug}/edit`}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </ButtonLink>
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label={`Delete ${service.name}`}
                        onClick={() => setPendingDelete(service)}
                      >
                        <IconTrash />
                      </Button>
                      <ActionMenu
                        items={[
                          {
                            label: 'Edit details',
                            href: `/admin/services/${service.slug}/edit`,
                          },
                          {
                            label:
                              service.status === 'published'
                                ? 'Unpublish'
                                : 'Publish',
                            onClick: async () => {
                              await updateAdminService(service.slug, {
                                status:
                                  service.status === 'published'
                                    ? 'draft'
                                    : 'published',
                              });
                              setToast('Service updated.');
                              await load();
                            },
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-table-footer">
            <span className="admin-help">
              {services.length} service{services.length === 1 ? '' : 's'}
            </span>
            <span className="admin-help">Live data from Django</span>
          </div>
        </div>
      ) : null}

      <AddServiceModal
        open={addOpen}
        nextOrder={nextOrder}
        onClose={() => setAddOpen(false)}
        onCreated={(service, continueEditing) => {
          setAddOpen(false);
          setToast(`${service.name} created.`);
          if (continueEditing) {
            router.push(`/admin/services/${service.slug}/edit`);
          } else {
            void load();
          }
        }}
      />
      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this service?"
        body={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed from the homepage and services page.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={() => void removeService()}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
