import { BlogForm } from '@/components/admin/BlogForm';
import { PageHeader } from '@/components/admin/ui';

export default function NewBlogPage() {
  return (
    <>
      <PageHeader
        title="Add blog post"
        description="Write a new studio note for the site."
      />
      <BlogForm mode="create" />
    </>
  );
}
