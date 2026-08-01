import { ServiceForm } from '@/components/admin/ServiceForm';
import { PageHeader } from '@/components/admin/ui';

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="Add service"
        description="Define a new service for the public site."
      />
      <ServiceForm mode="create" />
    </>
  );
}
