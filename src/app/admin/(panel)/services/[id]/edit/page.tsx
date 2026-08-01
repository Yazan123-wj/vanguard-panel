'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ServiceForm } from '@/components/admin/ServiceForm';
import {
  Button,
  EmptyState,
  PageHeader,
  SkeletonRows,
} from '@/components/admin/ui';
import { getAdminService, type AdminServiceRecord } from '@/lib/admin-api';

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<AdminServiceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const record = await getAdminService(params.id);
        if (alive) setService(record);
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
        <PageHeader title="Edit service" description="Loading…" />
        <SkeletonRows rows={4} />
      </>
    );
  }

  if (!service) {
    return (
      <EmptyState
        title="Service not found"
        description={error || 'This service may have been removed.'}
        action={
          <Button onClick={() => window.location.assign('/admin/services')}>
            Back to services
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Edit service" description={service.name} />
      <ServiceForm mode="edit" initial={service} />
    </>
  );
}
