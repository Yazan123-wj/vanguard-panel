import { ProjectForm } from '@/components/admin/ProjectForm';
import { PageHeader } from '@/components/admin/ui';

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="Add project"
        description="Create a new portfolio project for the gallery."
      />
      <ProjectForm mode="create" />
    </>
  );
}
