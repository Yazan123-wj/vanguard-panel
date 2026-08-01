/**
 * Client-side API for the Next.js admin panel → Django backend.
 */

export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export type AdminBlogRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  date: string;
  category: string;
  status: ContentStatus;
  image?: string;
  readTime?: string;
  updatedAt: string;
};

export type AdminProjectImage = {
  id: number;
  url: string;
  order: number;
  isCover: boolean;
};

export type AdminServiceRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  summary?: string;
  tags: string[];
  status: ContentStatus;
  order: number;
  defineItems: { title: string; description: string }[];
  workSteps: { title: string; description: string }[];
  leaveWith: { title: string; description: string }[];
  projectCount: number;
  updatedAt: string;
};

export type AdminProjectRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  date: string;
  status: ContentStatus;
  featured: boolean;
  order: number;
  externalUrl?: string;
  cover: string;
  services: string[];
  images: AdminProjectImage[];
  updatedAt: string;
};

export type AdminOffice = {
  id?: number;
  order: number;
  city: string;
  address: string;
  phone: string;
  enabled: boolean;
};

export type AdminSocial = {
  id?: number;
  order: number;
  label: string;
  url: string;
  enabled: boolean;
  openInNewTab: boolean;
};

export type AdminFooterData = {
  contactEmail: string;
  offices: AdminOffice[];
  social: AdminSocial[];
};

export type AdminMediaRecord = {
  id: number;
  name: string;
  url: string;
  alt: string;
  size: string;
  type: string;
  uploadedAt: string;
  usedBy: string[];
};

export type AdminDashboardData = {
  projects: number;
  services: number;
  blogs: number;
  media: number;
  published: number;
  drafts: number;
  recentProjects: AdminProjectRecord[];
  draftItems: {
    id: string;
    title: string;
    kind: string;
    href: string;
    meta: string;
  }[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  'http://127.0.0.1:8001';

const ADMIN_TOKEN =
  process.env.NEXT_PUBLIC_ADMIN_API_TOKEN ?? 'vanguard-admin-dev';

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('X-Admin-Token', ADMIN_TOKEN);
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as {
        detail?: string | Record<string, unknown>;
      };
      if (typeof data.detail === 'string') detail = data.detail;
      else if (data.detail) detail = JSON.stringify(data.detail);
      else detail = JSON.stringify(data);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Dashboard
export const getAdminDashboard = () =>
  adminFetch<AdminDashboardData>('/api/admin/dashboard/');

// Blogs
export const listAdminBlogs = () =>
  adminFetch<AdminBlogRecord[]>('/api/admin/blogs/');
export const getAdminBlog = (slug: string) =>
  adminFetch<AdminBlogRecord>(`/api/admin/blogs/${encodeURIComponent(slug)}/`);

function blogFormData(
  payload: Partial<AdminBlogRecord> & { title?: string; date?: string },
  imageFile?: File | null,
) {
  const form = new FormData();
  if (payload.title != null) form.append('title', payload.title);
  if (payload.subtitle != null) form.append('subtitle', payload.subtitle);
  if (payload.body != null) form.append('body', payload.body);
  if (payload.date != null) form.append('date', payload.date);
  if (payload.category != null) form.append('category', payload.category);
  if (payload.status != null) {
    form.append(
      'status',
      payload.status === 'scheduled' ? 'draft' : payload.status,
    );
  }
  if (payload.readTime != null) form.append('readTime', payload.readTime);
  if (imageFile) form.append('image', imageFile);
  return form;
}

export const createAdminBlog = (
  payload: Partial<AdminBlogRecord> & { title: string; date: string },
  imageFile?: File | null,
) =>
  adminFetch<AdminBlogRecord>('/api/admin/blogs/', {
    method: 'POST',
    body: blogFormData(
      {
        ...payload,
        subtitle: payload.subtitle ?? '',
        body: payload.body ?? '',
        category: payload.category ?? 'Studio',
        status: payload.status ?? 'draft',
        readTime: payload.readTime ?? '5 min read',
      },
      imageFile,
    ),
  });

export const updateAdminBlog = (
  slug: string,
  payload: Partial<AdminBlogRecord>,
  imageFile?: File | null,
) =>
  adminFetch<AdminBlogRecord>(
    `/api/admin/blogs/${encodeURIComponent(slug)}/`,
    {
      method: 'PATCH',
      body: blogFormData(payload, imageFile),
    },
  );

export const deleteAdminBlog = (slug: string) =>
  adminFetch<void>(`/api/admin/blogs/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
  });

// Services
export const listAdminServices = () =>
  adminFetch<AdminServiceRecord[]>('/api/admin/services/');
export const getAdminService = (slug: string) =>
  adminFetch<AdminServiceRecord>(
    `/api/admin/services/${encodeURIComponent(slug)}/`,
  );
export const createAdminService = (payload: Partial<AdminServiceRecord> & { name: string }) =>
  adminFetch<AdminServiceRecord>('/api/admin/services/', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      description: payload.description ?? '',
      summary: payload.summary ?? '',
      tags: payload.tags ?? [],
      status: payload.status ?? 'draft',
      order: payload.order ?? 0,
      defineItems: payload.defineItems ?? [],
      workSteps: payload.workSteps ?? [],
      leaveWith: payload.leaveWith ?? [],
    }),
  });
export const updateAdminService = (
  slug: string,
  payload: Partial<AdminServiceRecord>,
) =>
  adminFetch<AdminServiceRecord>(
    `/api/admin/services/${encodeURIComponent(slug)}/`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        summary: payload.summary,
        tags: payload.tags,
        status: payload.status,
        order: payload.order,
        defineItems: payload.defineItems,
        workSteps: payload.workSteps,
        leaveWith: payload.leaveWith,
      }),
    },
  );
export const deleteAdminService = (slug: string) =>
  adminFetch<void>(`/api/admin/services/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
  });

// Projects
export const listAdminProjects = () =>
  adminFetch<AdminProjectRecord[]>('/api/admin/projects/');
export const getAdminProject = (slug: string) =>
  adminFetch<AdminProjectRecord>(
    `/api/admin/projects/${encodeURIComponent(slug)}/`,
  );
export const createAdminProject = (
  payload: Partial<AdminProjectRecord> & { title: string; date: string },
) =>
  adminFetch<AdminProjectRecord>('/api/admin/projects/', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      subtitle: payload.subtitle ?? '',
      description: payload.description ?? '',
      overview: payload.overview ?? '',
      date: payload.date,
      status: payload.status ?? 'draft',
      featured: payload.featured ?? false,
      order: payload.order ?? 0,
      externalUrl: payload.externalUrl ?? '',
      services: payload.services ?? [],
      serviceNames: payload.services ?? [],
    }),
  });
export const updateAdminProject = (
  slug: string,
  payload: Partial<AdminProjectRecord>,
) =>
  adminFetch<AdminProjectRecord>(
    `/api/admin/projects/${encodeURIComponent(slug)}/`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        overview: payload.overview,
        date: payload.date,
        status: payload.status,
        featured: payload.featured,
        order: payload.order,
        externalUrl: payload.externalUrl,
        services: payload.services,
        serviceNames: payload.services,
      }),
    },
  );
export const deleteAdminProject = (slug: string) =>
  adminFetch<void>(`/api/admin/projects/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
  });

export const uploadAdminProjectImages = (slug: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  return adminFetch<AdminProjectImage[]>(
    `/api/admin/projects/${encodeURIComponent(slug)}/images/`,
    { method: 'POST', body: form },
  );
};

export const deleteAdminProjectImage = (slug: string, imageId: number) =>
  adminFetch<void>(
    `/api/admin/projects/${encodeURIComponent(slug)}/images/${imageId}/`,
    { method: 'DELETE' },
  );

export const setAdminProjectCover = (slug: string, imageId: number) =>
  adminFetch<AdminProjectImage>(
    `/api/admin/projects/${encodeURIComponent(slug)}/images/${imageId}/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ makeCover: true }),
    },
  );

// Footer
export const getAdminFooter = () =>
  adminFetch<AdminFooterData>('/api/admin/footer/');
export const saveAdminFooter = (payload: AdminFooterData) =>
  adminFetch<AdminFooterData>('/api/admin/footer/', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

// Media
export const listAdminMedia = () =>
  adminFetch<AdminMediaRecord[]>('/api/admin/media/');
export const createAdminMediaUrl = (payload: {
  name: string;
  url: string;
  alt?: string;
}) =>
  adminFetch<AdminMediaRecord>('/api/admin/media/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateAdminMedia = (
  id: number,
  payload: Partial<Pick<AdminMediaRecord, 'name' | 'alt' | 'url'>>,
) =>
  adminFetch<AdminMediaRecord>(`/api/admin/media/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteAdminMedia = (id: number) =>
  adminFetch<void>(`/api/admin/media/${id}/`, { method: 'DELETE' });
