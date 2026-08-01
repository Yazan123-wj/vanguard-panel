'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  IconBlogs,
  IconPlus,
  IconProjects,
  IconServices,
} from '@/components/admin/icons';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  SkeletonRows,
  StatusBadge,
} from '@/components/admin/ui';
import {
  getAdminDashboard,
  type AdminDashboardData,
} from '@/lib/admin-api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const dash = await getAdminDashboard();
        if (alive) setData(dash);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load dashboard from Django.',
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-dash">
        <SkeletonRows rows={6} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-dash">
        <Card>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-desc" style={{ marginTop: 12 }}>
            {error || 'API unavailable.'} Start Django on port 8001 and refresh.
          </p>
          <Button
            style={{ marginTop: 16 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      label: 'Projects',
      value: data.projects,
      hint: 'Gallery items',
      href: '/admin/projects',
      icon: IconProjects,
    },
    {
      label: 'Services',
      value: data.services,
      hint: 'Offerings',
      href: '/admin/services',
      icon: IconServices,
    },
    {
      label: 'Blogs',
      value: data.blogs,
      hint: 'Studio notes',
      href: '/admin/blogs',
      icon: IconBlogs,
    },
  ];

  return (
    <div className="admin-dash">
      <section className="admin-dash__hero">
        <div className="admin-dash__hero-copy">
          <p className="admin-dash__eyebrow">Live from Django</p>
          <h1 className="admin-page-title">Welcome back</h1>
          <p className="admin-page-desc">
            {data.published} published · {data.drafts} draft
            {data.drafts === 1 ? '' : 's'} waiting.
          </p>
        </div>
        <div className="admin-dash__hero-actions">
          <ButtonLink href="/admin/projects/new">
            <IconPlus /> Add project
          </ButtonLink>
          <ButtonLink href="/admin/services" variant="secondary">
            Open services
          </ButtonLink>
        </div>
      </section>

      <section className="admin-stats admin-stats--3" aria-label="Summary">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="admin-stat-link">
              <Card className="admin-stat" padded={false}>
                <div className="admin-card__pad">
                  <div className="admin-stat__top">
                    <div className="admin-stat__label">{stat.label}</div>
                    <div className="admin-stat__icon">
                      <Icon />
                    </div>
                  </div>
                  <div className="admin-stat__value">{stat.value}</div>
                  <div className="admin-stat__hint">{stat.hint}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="admin-dash-grid">
        <Card className="admin-panel-card" padded={false}>
          <div className="admin-panel-card__head">
            <h2 className="admin-section-title">Recent projects</h2>
            <Link href="/admin/projects" className="admin-text-link">
              View all
            </Link>
          </div>
          <div className="admin-panel-card__body">
            {data.recentProjects.length === 0 ? (
              <p className="admin-help admin-panel-card__empty">
                No projects yet.
              </p>
            ) : (
              data.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.slug}/edit`}
                  className="admin-project-row"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.cover || '/brand/vanguard-mark.png'}
                    alt=""
                    className="admin-thumb admin-thumb--lg"
                  />
                  <div className="admin-project-row__copy">
                    <div className="admin-cell-title">{project.title}</div>
                    <div className="admin-cell-sub">{project.subtitle}</div>
                  </div>
                  <StatusBadge status={project.status} />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="admin-panel-card" padded={false}>
          <div className="admin-panel-card__head">
            <div>
              <h2 className="admin-section-title">Needs attention</h2>
              <p className="admin-help" style={{ marginTop: 4 }}>
                Drafts from the live database
              </p>
            </div>
            <Badge tone="warning">{data.drafts} drafts</Badge>
          </div>
          <div className="admin-panel-card__body">
            {data.draftItems.length === 0 ? (
              <p className="admin-help admin-panel-card__empty">
                You’re caught up — no drafts waiting.
              </p>
            ) : (
              data.draftItems.map((item) => (
                <Link key={`${item.kind}-${item.id}`} href={item.href} className="admin-draft-row">
                  <div>
                    <div className="admin-cell-title">{item.title}</div>
                    <div className="admin-cell-sub">Updated {item.meta}</div>
                  </div>
                  <Badge>{item.kind}</Badge>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
