'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { IconExternal, IconPlus, IconTrash, IconUpload } from '@/components/admin/icons';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  Modal,
  Switch,
  Toast,
} from '@/components/admin/ui';
import {
  createAdminProject,
  deleteAdminProject,
  deleteAdminProjectImage,
  getAdminProject,
  listAdminServices,
  setAdminProjectCover,
  updateAdminProject,
  uploadAdminProjectImages,
  type AdminProjectImage,
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
    description?: string;
    overview?: string;
    externalUrl?: string;
    status?: ContentStatus;
    featured?: boolean;
    services?: string[];
    images?: AdminProjectImage[];
  };
};

type LocalImage = {
  key: string;
  id?: number;
  url: string;
  file?: File;
  isCover: boolean;
};

export function ProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slug, setSlug] = useState(initial?.slug ?? initial?.id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [overview, setOverview] = useState(initial?.overview ?? '');
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? '');
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [services, setServices] = useState<string[]>(initial?.services ?? []);
  const [allServiceNames, setAllServiceNames] = useState<string[]>([]);
  const [serviceQuery, setServiceQuery] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<LocalImage[]>(() =>
    (initial?.images ?? []).map((img, index) => ({
      key: `server-${img.id}`,
      id: img.id,
      url: img.url,
      isCover: img.isCover || index === 0,
    })),
  );

  useEffect(() => {
    listAdminServices()
      .then((list) => setAllServiceNames(list.map((s) => s.name)))
      .catch(() => setAllServiceNames([]));
  }, []);

  const available = allServiceNames.filter(
    (name) =>
      !services.includes(name) &&
      name.toLowerCase().includes(serviceQuery.toLowerCase()),
  );

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/'),
    );
    if (!next.length) {
      setToast('Please choose image files (JPG, PNG, WebP).');
      return;
    }
    setImages((prev) => {
      const mapped = next.map((file, index) => ({
        key: `local-${file.name}-${file.size}-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        file,
        isCover: prev.length === 0 && index === 0,
      }));
      return [...prev, ...mapped];
    });
  };

  const refreshImages = async (projectSlug: string) => {
    const project = await getAdminProject(projectSlug);
    setImages(
      (project.images ?? []).map((img, index) => ({
        key: `server-${img.id}`,
        id: img.id,
        url: img.url,
        isCover: img.isCover || index === 0,
      })),
    );
  };

  const save = async (nextStatus: ContentStatus = status) => {
    if (!title.trim()) {
      setToast('Project title is required.');
      return;
    }
    if (!date) {
      setToast('Project date is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description,
        overview,
        date,
        status: (nextStatus === 'scheduled' ? 'draft' : nextStatus) as ContentStatus,
        featured,
        externalUrl,
        services,
      };

      let activeSlug = slug;
      if (mode === 'create' || !activeSlug) {
        const created = await createAdminProject(payload);
        activeSlug = created.slug;
        setSlug(created.slug);
        setStatus(created.status);
      } else {
        const updated = await updateAdminProject(activeSlug, payload);
        setStatus(updated.status);
      }

      const coverLocal = images.find((img) => img.isCover);
      const pendingCover = coverLocal?.file ? [coverLocal.file] : [];
      const pendingRest = images
        .filter((img) => img.file && img.key !== coverLocal?.key)
        .map((img) => img.file!);

      // Upload cover first, then promote it (needed when project already had images).
      if (pendingCover.length) {
        const uploaded = await uploadAdminProjectImages(
          activeSlug,
          pendingCover,
        );
        const coverId = uploaded[0]?.id;
        if (coverId) await setAdminProjectCover(activeSlug, coverId);
      }
      if (pendingRest.length) {
        await uploadAdminProjectImages(activeSlug, pendingRest);
      }
      if (coverLocal?.id && !coverLocal.file) {
        await setAdminProjectCover(activeSlug, coverLocal.id);
      }

      await refreshImages(activeSlug);

      setToast(
        (nextStatus === 'published' ? 'published' : status) === 'published' ||
          nextStatus === 'published'
          ? 'Project published to the gallery.'
          : 'Project saved.',
      );

      if (mode === 'create') {
        router.replace(`/admin/projects/${activeSlug}/edit`);
      }
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : 'Could not save. Is Django running on :8001?',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (item: LocalImage) => {
    if (item.id && slug) {
      try {
        await deleteAdminProjectImage(slug, item.id);
        await refreshImages(slug);
        setToast('Image removed.');
      } catch (error) {
        setToast(
          error instanceof Error ? error.message : 'Could not remove image.',
        );
      }
      return;
    }
    if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
    setImages((prev) => {
      const next = prev.filter((img) => img.key !== item.key);
      if (item.isCover && next[0]) {
        next[0] = { ...next[0], isCover: true };
      }
      return next;
    });
  };

  const makeCover = async (item: LocalImage) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.key === item.key })),
    );
    if (item.id && slug) {
      try {
        await setAdminProjectCover(slug, item.id);
        await refreshImages(slug);
        setToast('Cover image updated.');
      } catch (error) {
        setToast(
          error instanceof Error ? error.message : 'Could not set cover.',
        );
      }
    }
  };

  return (
    <>
      <div className="admin-form-grid">
        <div className="admin-stack">
          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Basic information</h2>
              <Field label="Project title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="NETFLIX"
                />
              </Field>
              <Field label="Project subtitle">
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Stranger Things Experience"
                />
              </Field>
              <Field label="Project date">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Services</h2>
              <Field
                label="Connected services"
                hint="Search and select one or more services as tags."
              >
                <Input
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="Search services…"
                />
              </Field>
              {serviceQuery && available.length > 0 ? (
                <div className="admin-stack">
                  {available.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      onClick={() => {
                        setServices((prev) => [...prev, name]);
                        setServiceQuery('');
                      }}
                    >
                      <IconPlus /> {name}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="admin-tags">
                {services.map((name) => (
                  <span key={name} className="admin-chip">
                    {name}
                    <button
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setServices((prev) => prev.filter((s) => s !== name))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Detail copy</h2>
              <Field
                label="Overview"
                hint="Left column under the images — larger lead text."
              >
                <RichTextEditor
                  value={overview}
                  onChange={setOverview}
                  rows={6}
                  placeholder="Project overview…"
                />
              </Field>
              <Field
                label="Description"
                hint="Right column under the images — supporting copy."
              >
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  rows={6}
                  placeholder="Project description…"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Project images</h2>
              <p className="admin-help">
                Upload one or more images. The cover image is used on the gallery card.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
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
                  addFiles(e.dataTransfer.files);
                }}
              >
                <IconUpload />
                <strong style={{ color: 'inherit' }}>
                  Drag and drop images here
                </strong>
                <span>or click to browse · JPG, PNG, WebP · multiple allowed</span>
              </div>

              {images.length > 0 ? (
                <div className="admin-media-grid">
                  {images.map((image) => (
                    <div
                      key={image.key}
                      className="admin-card admin-media-card"
                      style={{ padding: 0 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="" />
                      <div className="admin-media-card__meta admin-stack">
                        {image.isCover ? (
                          <span className="admin-badge admin-badge--accent">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost admin-btn--sm"
                            onClick={() => void makeCover(image)}
                          >
                            Set as cover
                          </button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => void removeImage(image)}
                        >
                          <IconTrash /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">External website</h2>
              <Field
                label="Visit live site URL"
                hint="Leave empty to hide the button on the site."
              >
                <div style={{ position: 'relative' }}>
                  <IconExternal
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 15,
                      width: 16,
                      height: 16,
                      color: 'var(--admin-muted)',
                    }}
                  />
                  <Input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
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
                  ? 'Live in the projects gallery.'
                  : 'Saved privately as a draft.'}
              </p>
              <Switch
                checked={featured}
                onChange={setFeatured}
                label="Highlight as featured"
              />
              <Button
                disabled={saving}
                onClick={() => void save(status === 'published' ? 'published' : 'draft')}
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
              <ButtonLink
                href="/admin/projects"
                variant="ghost"
                style={{ width: '100%' }}
              >
                Back to projects
              </ButtonLink>
            </div>
          </Card>

          {mode === 'edit' && slug ? (
            <Card>
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">Danger zone</h2>
                <p className="admin-help">
                  Deleting a project removes it from the gallery.
                </p>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <IconTrash /> Delete project
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete this project?"
        body="The project and its images will be removed from the admin and the public gallery."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            if (slug) await deleteAdminProject(slug);
            router.push('/admin/projects');
          } catch (error) {
            setConfirmDelete(false);
            setToast(
              error instanceof Error ? error.message : 'Could not delete.',
            );
          }
        }}
      />

      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}
