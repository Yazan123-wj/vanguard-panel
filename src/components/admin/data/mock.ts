/**
 * Temporary development data for the admin UI.
 * Replace with live API calls when wiring to the Django backend.
 */

export type AdminStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export type AdminProject = {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  date: string;
  status: AdminStatus;
  featured: boolean;
  services: string[];
  cover: string;
  coverUrl?: string;
  updatedAt: string;
  externalUrl?: string;
  description: string;
  order: number;
};

export type AdminService = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  tags: string[];
  status: AdminStatus;
  projectCount: number;
  order: number;
  updatedAt: string;
  defineItems: { title: string; description: string }[];
  workSteps: { title: string; description: string }[];
  leaveWith: { title: string; description: string }[];
};

export type AdminBlog = {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  date: string;
  status: AdminStatus;
  updatedAt: string;
  category: string;
  body: string;
  imageUrl?: string;
};

export type AdminFooterGroup = {
  id: string;
  name: string;
  links: {
    id: string;
    label: string;
    url: string;
    type: 'social' | 'office' | 'custom';
    enabled: boolean;
    openInNewTab: boolean;
  }[];
};

export type AdminMedia = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedAt: string;
  usedBy: string[];
  alt: string;
};

export const ADMIN_PROJECTS: AdminProject[] = [
  {
    id: 'p1',
    title: 'NETFLIX',
    subtitle: 'Stranger Things Experience',
    date: '2025-01-12',
    status: 'published',
    featured: true,
    services: ['Creative Direction', 'Product & Web'],
    cover:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
    updatedAt: '2026-07-28',
    externalUrl: 'https://example.com',
    description: 'An immersive interactive campaign for the series launch.',
    order: 1,
  },
  {
    id: 'p2',
    title: 'Google',
    subtitle: 'Cloud BigQuery',
    date: '2025-03-02',
    status: 'published',
    featured: false,
    services: ['Go-to-Market', 'Visual Identity'],
    cover:
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=400&auto=format&fit=crop',
    updatedAt: '2026-07-20',
    description: 'Campaign system across social and web surfaces.',
    order: 2,
  },
  {
    id: 'p3',
    title: 'NIKE',
    subtitle: 'Air Max Future Beat',
    date: '2025-06-18',
    status: 'draft',
    featured: false,
    services: ['Creative Direction', 'Visual Identity'],
    cover:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
    updatedAt: '2026-08-01',
    description: 'Physical and 3D experience for product drop.',
    order: 3,
  },
  {
    id: 'p4',
    title: 'Apple',
    subtitle: 'Vision Pro Showcase',
    date: '2026-01-08',
    status: 'scheduled',
    featured: true,
    services: ['Product & Web', 'Creative Direction'],
    cover:
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=400&auto=format&fit=crop',
    updatedAt: '2026-07-30',
    description: 'Spatial storytelling for the Vision Pro launch.',
    order: 4,
  },
];

export const ADMIN_SERVICES: AdminService[] = [
  {
    id: 's1',
    name: 'Brand Strategy',
    description:
      'Positioning, narrative, and identity architecture that gives your company a defensible point of view.',
    tags: ['Research', 'Positioning', 'Naming'],
    status: 'published',
    projectCount: 8,
    order: 1,
    updatedAt: '2026-07-12',
    defineItems: [
      {
        title: 'Category position',
        description: 'Where you stand and why it matters.',
      },
    ],
    workSteps: [
      {
        title: 'Discovery workshops',
        description: 'Align founders and operators on audience and truth.',
      },
    ],
    leaveWith: [
      {
        title: 'Positioning statement',
        description: 'A sharp, usable definition of the brand.',
      },
    ],
  },
  {
    id: 's2',
    name: 'Visual Identity',
    description:
      'Logo systems, typography, and motion built to scale across every surface.',
    tags: ['Logo', 'Type', 'Motion'],
    status: 'published',
    projectCount: 12,
    order: 2,
    updatedAt: '2026-07-18',
    defineItems: [],
    workSteps: [],
    leaveWith: [],
  },
  {
    id: 's3',
    name: 'Product & Web',
    description:
      'Marketing sites and product interfaces engineered with craft and clarity.',
    tags: ['Design', 'Build', 'Launch'],
    status: 'published',
    projectCount: 15,
    order: 3,
    updatedAt: '2026-07-22',
    defineItems: [],
    workSteps: [],
    leaveWith: [],
  },
  {
    id: 's4',
    name: 'Go-to-Market',
    description:
      'Launch strategy and campaigns that compound attention into revenue.',
    tags: ['GTM', 'Campaigns'],
    status: 'draft',
    projectCount: 4,
    order: 4,
    updatedAt: '2026-08-01',
    defineItems: [],
    workSteps: [],
    leaveWith: [],
  },
];

export const ADMIN_BLOGS: AdminBlog[] = [
  {
    id: 'b1',
    title: 'Building brands that outlive trends',
    subtitle:
      'Why the most durable companies invest in brand as infrastructure — not decoration.',
    date: '2026-04-18',
    status: 'published',
    updatedAt: '2026-04-18',
    category: 'Brand Strategy',
    body: 'Trends are useful until they become a substitute for judgment...',
  },
  {
    id: 'b2',
    title: 'The case against the relaunch',
    subtitle: 'How to tell real identity change from cosmetic rebrands.',
    date: '2026-04-02',
    status: 'published',
    updatedAt: '2026-04-02',
    category: 'Identity',
    body: 'A relaunch announces itself with a new logo...',
  },
  {
    id: 'b3',
    title: 'Hiring for taste',
    subtitle: 'Portfolios lie. Craft shows up in the edits people refuse to ship.',
    date: '2026-01-14',
    status: 'draft',
    updatedAt: '2026-08-01',
    category: 'Studio',
    body: 'A polished case study can hide a weak process...',
  },
];

export const ADMIN_FOOTER_GROUPS: AdminFooterGroup[] = [
  {
    id: 'g1',
    name: 'Social',
    links: [
      {
        id: 'l1',
        label: 'Instagram',
        url: 'https://instagram.com',
        type: 'social',
        enabled: true,
        openInNewTab: true,
      },
      {
        id: 'l2',
        label: 'LinkedIn',
        url: 'https://linkedin.com',
        type: 'social',
        enabled: true,
        openInNewTab: true,
      },
      {
        id: 'l3',
        label: 'Facebook',
        url: 'https://facebook.com',
        type: 'social',
        enabled: false,
        openInNewTab: true,
      },
    ],
  },
  {
    id: 'g2',
    name: 'Offices',
    links: [
      {
        id: 'l4',
        label: 'Vietnam',
        url: '#',
        type: 'office',
        enabled: true,
        openInNewTab: false,
      },
      {
        id: 'l5',
        label: 'France',
        url: '#',
        type: 'office',
        enabled: true,
        openInNewTab: false,
      },
    ],
  },
];

export const ADMIN_MEDIA: AdminMedia[] = [
  {
    id: 'm1',
    name: 'netflix-cover.jpg',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    type: 'image/jpeg',
    size: '248 KB',
    uploadedAt: '2026-07-28',
    usedBy: ['NETFLIX'],
    alt: 'Netflix project cover',
  },
  {
    id: 'm2',
    name: 'nike-hero.jpg',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    type: 'image/jpeg',
    size: '312 KB',
    uploadedAt: '2026-08-01',
    usedBy: ['NIKE'],
    alt: 'Nike product still',
  },
  {
    id: 'm3',
    name: 'studio-note.jpg',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    type: 'image/jpeg',
    size: '198 KB',
    uploadedAt: '2026-04-18',
    usedBy: [],
    alt: 'Studio notes cover',
  },
];
