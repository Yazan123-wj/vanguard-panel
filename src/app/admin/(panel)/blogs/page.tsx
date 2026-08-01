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
  deleteAdminBlog,
  listAdminBlogs,
  type AdminBlogRecord,
} from '@/lib/admin-api';

export default function AdminBlogsPage() {
  const [items, setItems] = useState<AdminBlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminBlogRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const blogs = await listAdminBlogs();
        if (alive) setItems(blogs);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load blogs from the API.',
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const blogs = useMemo(() => {
    return items.filter((blog) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.subtitle.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || blog.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  const removeBlog = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteAdminBlog(pendingDelete.slug);
      setItems((prev) => prev.filter((b) => b.id !== pendingDelete.id));
      setToast(`“${pendingDelete.title}” deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setToast(
        err instanceof Error ? err.message : 'Could not delete this post.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Blogs"
        description="Studio notes synced with the live website via Django."
        actions={
          <ButtonLink href="/admin/blogs/new">
            <IconPlus /> Add blog post
          </ButtonLink>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-toolbar__search">
          <IconSearch className="admin-toolbar__search-icon" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs…"
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
          description={`${error} Start Django on port 8001, then refresh.`}
          action={
            <Button onClick={() => window.location.reload()}>Retry</Button>
          }
        />
      ) : null}

      {!loading && !error && blogs.length === 0 ? (
        <EmptyState
          title="No blog posts yet"
          description="Publish your first note — it will appear on /blogs."
          action={
            <ButtonLink href="/admin/blogs/new">
              <IconPlus /> Add blog post
            </ButtonLink>
          }
        />
      ) : null}

      {!loading && !error && blogs.length > 0 ? (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <div className="admin-cell-title">{blog.title}</div>
                      <div className="admin-cell-sub">
                        {blog.subtitle.slice(0, 80)}
                        {blog.subtitle.length > 80 ? '…' : ''}
                      </div>
                    </td>
                    <td>{blog.date}</td>
                    <td>
                      <StatusBadge status={blog.status} />
                    </td>
                    <td>{blog.updatedAt}</td>
                    <td>
                      <div className="admin-row-actions">
                        <ButtonLink
                          href={`/admin/blogs/${blog.slug}/edit`}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </ButtonLink>
                        {blog.status === 'published' ? (
                          <ButtonLink
                            href={`/blogs/${blog.slug}`}
                            variant="ghost"
                            size="sm"
                          >
                            View
                          </ButtonLink>
                        ) : null}
                        <Button
                          variant="danger"
                          size="icon"
                          aria-label={`Delete ${blog.title}`}
                          onClick={() => setPendingDelete(blog)}
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

          <div className="admin-card-list">
            {blogs.map((blog) => (
              <div key={blog.id} className="admin-card admin-mobile-card">
                <div className="admin-cell-title">{blog.title}</div>
                <div className="admin-cell-sub">{blog.subtitle}</div>
                <div style={{ marginTop: 10 }}>
                  <StatusBadge status={blog.status} />
                </div>
                <div
                  className="admin-row-actions"
                  style={{ marginTop: 12, justifyContent: 'stretch' }}
                >
                  <ButtonLink
                    href={`/admin/blogs/${blog.slug}/edit`}
                    variant="secondary"
                    size="sm"
                    className="admin-btn-block"
                  >
                    Edit post
                  </ButtonLink>
                  <Button
                    variant="danger"
                    size="icon"
                    aria-label={`Delete ${blog.title}`}
                    onClick={() => setPendingDelete(blog)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete this blog post?"
        body={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from Notes and the blogs page.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={() => void removeBlog()}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
