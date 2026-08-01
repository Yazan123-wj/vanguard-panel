'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { IconExternal, IconTrash, IconUpload } from '@/components/admin/icons';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
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
  createAdminBlog,
  deleteAdminBlog,
  updateAdminBlog,
  type ContentStatus,
} from '@/lib/admin-api';

type Props = {
  mode: 'create' | 'edit';
  initial?: {
    slug?: string;
    id?: string;
    title?: string;
    subtitle?: string;
    date?: string;
    category?: string;
    body?: string;
    status?: ContentStatus;
    image?: string;
    updatedAt?: string;
  };
};

export function BlogForm({ mode, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState(initial?.category ?? 'Studio');
  const [body, setBody] = useState(initial?.body ?? '');
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [slug, setSlug] = useState(initial?.slug ?? initial?.id ?? '');
  const [coverPreview, setCoverPreview] = useState(initial?.image ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickCover = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('Please choose an image file (JPG, PNG, WebP).');
      return;
    }
    if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const save = async (next: ContentStatus = status) => {
    if (!title.trim()) {
      setToast('Blog title is required.');
      return;
    }
    if (!date) {
      setToast('Publication date is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        body,
        date,
        category: category.trim() || 'Studio',
        status: (next === 'scheduled' ? 'draft' : next) as ContentStatus,
      };

      if (mode === 'create' || !slug) {
        const created = await createAdminBlog(payload, coverFile);
        setSlug(created.slug);
        setStatus(created.status);
        if (created.image) {
          if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
          setCoverPreview(created.image);
          setCoverFile(null);
        }
        setToast(
          created.status === 'published'
            ? 'Blog published — it now appears on the website.'
            : 'Blog saved as draft.',
        );
        router.replace(`/admin/blogs/${created.slug}/edit`);
      } else {
        const updated = await updateAdminBlog(slug, payload, coverFile);
        setStatus(updated.status);
        if (updated.image) {
          if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
          setCoverPreview(updated.image);
          setCoverFile(null);
        }
        setToast(
          updated.status === 'published'
            ? 'Blog published — it now appears on the website.'
            : 'Blog post updated.',
        );
      }
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : 'Could not save. Is the Django API running on :8001?',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!slug) {
      router.push('/admin/blogs');
      return;
    }
    try {
      await deleteAdminBlog(slug);
      router.push('/admin/blogs');
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : 'Could not delete this post.',
      );
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="admin-form-grid">
        <div className="admin-stack">
          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Blog information</h2>
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ fontSize: 22, fontWeight: 600, minHeight: 56 }}
                  placeholder="Building brands that outlive trends"
                />
              </Field>
              <Field label="Subtitle">
                <Textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                />
              </Field>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <Field label="Publication date">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
                <Field label="Category">
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Cover image</h2>
              <p className="admin-help">
                Upload a cover image for the blogs grid and article page.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  pickCover(e.target.files);
                  e.target.value = '';
                }}
              />
              <div
                className="admin-upload"
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickCover(e.dataTransfer.files);
                }}
              >
                <IconUpload />
                <strong style={{ color: 'inherit' }}>
                  Drag and drop cover image
                </strong>
                <span>or click to browse · JPG, PNG, WebP</span>
              </div>
              {coverPreview ? (
                <div
                  className="admin-card"
                  style={{ padding: 12, overflow: 'hidden' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{
                      width: '100%',
                      maxHeight: 280,
                      objectFit: 'cover',
                      borderRadius: 10,
                      display: 'block',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button variant="danger" size="sm" onClick={clearCover}>
                      <IconTrash /> Remove
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Blog content</h2>
              <Field
                label="Article body"
                hint="Separate paragraphs with a blank line. Published posts appear on /blogs."
              >
                <RichTextEditor
                  value={body}
                  onChange={setBody}
                  rows={16}
                  placeholder="Write the full article…"
                />
              </Field>
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
                  ? 'Live on the blogs page.'
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
              {slug && status === 'published' ? (
                <a
                  href={`/blogs/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn--ghost"
                  style={{ width: '100%' }}
                >
                  <IconExternal /> View on site
                </a>
              ) : null}
              <ButtonLink
                href="/admin/blogs"
                variant="ghost"
                style={{ width: '100%' }}
              >
                Back to blogs
              </ButtonLink>
            </div>
          </Card>

          {mode === 'edit' ? (
            <Card>
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">Danger zone</h2>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <IconTrash /> Delete post
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete this blog post?"
        body="The article will be removed from Notes and the blogs page."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
      />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
