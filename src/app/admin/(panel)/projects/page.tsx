'use client';

import { useEffect, useMemo, useState } from 'react';

import { IconPlus, IconSearch, IconTrash } from '@/components/admin/icons';
import {
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
  deleteAdminProject,
  listAdminProjects,
  listAdminServices,
  type AdminProjectRecord,
} from '@/lib/admin-api';

export default function AdminProjectsPage() {
  const [items, setItems] = useState<AdminProjectRecord[]>([]);
  const [serviceNames, setServiceNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [service, setService] = useState('all');
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminProjectRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [projects, services] = await Promise.all([
          listAdminProjects(),
          listAdminServices(),
        ]);
        if (!alive) return;
        setItems(projects);
        setServiceNames(services.map((s) => s.name));
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Could not load projects.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const projects = useMemo(() => {
    return items.filter((project) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || project.status === status;
      const matchesService =
        service === 'all' || project.services.includes(service);
      return matchesQuery && matchesStatus && matchesService;
    });
  }, [items, query, status, service]);

  const removeProject = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteAdminProject(pendingDelete.slug);
      setItems((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      setToast(`“${pendingDelete.title}” deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : 'Could not delete this project.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Synced with the public projects gallery."
        actions={
          <ButtonLink href="/admin/projects/new">
            <IconPlus /> Add project
          </ButtonLink>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <IconSearch className="admin-toolbar__search-icon" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
          />
        </div>
        <div className="admin-toolbar__filters">
          <Select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="all">All services</option>
            {serviceNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
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
          description={`${error} Start Django on :8001.`}
          action={
            <Button onClick={() => window.location.reload()}>Retry</Button>
          }
        />
      ) : null}
      {!loading && !error && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add a project with a cover image URL to show it in the gallery."
          action={
            <ButtonLink href="/admin/projects/new">
              <IconPlus /> Add project
            </ButtonLink>
          }
        />
      ) : null}

      {!loading && !error && projects.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Services</th>
                <th>Date</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.cover || '/brand/vanguard-mark.png'}
                        alt=""
                        className="admin-thumb"
                      />
                      <div>
                        <div className="admin-cell-title">{project.title}</div>
                        <div className="admin-cell-sub">{project.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-tags">
                      {project.services.map((tag) => (
                        <span key={tag} className="admin-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{project.date}</td>
                  <td>
                    <StatusBadge status={project.status} />
                  </td>
                  <td>{project.updatedAt}</td>
                  <td>
                    <div className="admin-row-actions">
                      <ButtonLink
                        href={`/admin/projects/${project.slug}/edit`}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </ButtonLink>
                      <Button
                        variant="danger"
                        size="icon"
                        aria-label={`Delete ${project.title}`}
                        onClick={() => setPendingDelete(project)}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        body={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from the admin and the public gallery.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={() => void removeProject()}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
