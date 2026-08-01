'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ProjectForm } from '@/components/admin/ProjectForm';
import {
  Button,
  EmptyState,
  PageHeader,
  SkeletonRows,
} from '@/components/admin/ui';
import { getAdminProject, type AdminProjectRecord } from '@/lib/admin-api';

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<AdminProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const record = await getAdminProject(params.id);
        if (alive) setProject(record);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Not found');
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
        <PageHeader title="Edit project" description="Loading…" />
        <SkeletonRows rows={4} />
      </>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description={error || 'This project may have been removed.'}
        action={
          <Button onClick={() => window.location.assign('/admin/projects')}>
            Back to projects
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Edit project" description={project.title} />
      <ProjectForm mode="edit" initial={project} />
    </>
  );
}
