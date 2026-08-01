'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BlogForm } from '@/components/admin/BlogForm';
import {
  Button,
  EmptyState,
  PageHeader,
  SkeletonRows,
} from '@/components/admin/ui';
import { getAdminBlog, type AdminBlogRecord } from '@/lib/admin-api';

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<AdminBlogRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const record = await getAdminBlog(params.id);
        if (alive) setBlog(record);
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Not found');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <PageHeader title="Edit blog post" description="Loading…" />
        <SkeletonRows rows={4} />
      </>
    );
  }

  if (!blog) {
    return (
      <EmptyState
        title="Blog post not found"
        description={error || 'This post may have been removed.'}
        action={
          <Button onClick={() => window.location.assign('/admin/blogs')}>
            Back to blogs
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Edit blog post" description={blog.title} />
      <BlogForm mode="edit" initial={blog} />
    </>
  );
}
