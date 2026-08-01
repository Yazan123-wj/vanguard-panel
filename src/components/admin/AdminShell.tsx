'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { isAdminAuthed, setAdminAuthed } from '@/components/admin/auth';
import {
  IconBlogs,
  IconDashboard,
  IconFooter,
  IconLogout,
  IconMenu,
  IconProjects,
  IconServices,
  IconSettings,
} from '@/components/admin/icons';
import { Button } from '@/components/admin/ui';
import { SITE } from '@/lib/constants';

type NavItem = {
  href: string;
  label: string;
  icon: typeof IconDashboard;
  exact?: boolean;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: IconDashboard, exact: true }],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/projects', label: 'Projects', icon: IconProjects },
      { href: '/admin/services', label: 'Services', icon: IconServices },
      { href: '/admin/blogs', label: 'Blogs', icon: IconBlogs },
    ],
  },
  {
    label: 'Site',
    items: [
      { href: '/admin/footer-links', label: 'Footer links', icon: IconFooter },
      { href: '/admin/settings', label: 'Settings', icon: IconSettings },
    ],
  },
];

function crumbFor(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/projects')) return 'Projects';
  if (pathname.startsWith('/admin/services')) return 'Services';
  if (pathname.startsWith('/admin/blogs')) return 'Blogs';
  if (pathname.startsWith('/admin/footer-links')) return 'Footer links';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Admin';
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [router, pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div data-admin className="admin-login">
        <div className="admin-skeleton" style={{ width: 280, height: 120 }} />
      </div>
    );
  }

  const logout = () => {
    setAdminAuthed(false);
    router.replace('/admin/login');
  };

  return (
    <div data-admin>
      <div
        className={`admin-sidebar-backdrop ${mobileOpen ? 'is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      <div className="admin-shell">
        <aside
          className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}
          aria-label="Admin navigation"
        >
          <div className="admin-sidebar__brand">
            <Link
              href="/admin"
              className="admin-sidebar__brand-link"
              aria-label={SITE.name}
            >
              {collapsed ? (
                <Image
                  src={SITE.mark}
                  alt=""
                  width={28}
                  height={28}
                  className="admin-sidebar__mark"
                  priority
                />
              ) : (
                <Image
                  src={SITE.logo}
                  alt={SITE.name}
                  width={120}
                  height={18}
                  className="admin-sidebar__logo"
                  priority
                />
              )}
            </Link>
            {!collapsed ? <span className="admin-sidebar__badge">CMS</span> : null}
          </div>

          <nav className="admin-nav">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="admin-nav__group">
                <p className="admin-nav__section-label">{group.label}</p>
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`admin-nav__link ${active ? 'is-active' : ''}`}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="admin-nav__icon">
                        <Icon />
                      </span>
                      <span className="admin-nav__label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__user">
              <span className="admin-avatar" aria-hidden>
                A
              </span>
              <div className="admin-sidebar__user-meta">
                <div className="admin-sidebar__user-name">Admin</div>
                <div className="admin-sidebar__user-role">admin@vanguard.studio</div>
              </div>
            </div>
            <button
              type="button"
              className="admin-nav__link admin-nav__logout"
              onClick={logout}
              title={collapsed ? 'Log out' : undefined}
            >
              <span className="admin-nav__icon">
                <IconLogout />
              </span>
              <span className="admin-nav__label">Log out</span>
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header__left">
              <Button
                variant="ghost"
                size="icon"
                className="admin-mobile-only"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                <IconMenu />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="admin-desktop-only"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setCollapsed((v) => !v)}
              >
                <IconMenu />
              </Button>
              <nav className="admin-crumb" aria-label="Breadcrumb">
                <span>Admin</span>
                <span className="admin-crumb__sep" aria-hidden>
                  /
                </span>
                <strong>{crumbFor(pathname)}</strong>
              </nav>
            </div>
            <div className="admin-header__right">
              <Link href="/" className="admin-header__ghost-link admin-desktop-only">
                View site
              </Link>
              <Link
                href="/admin/settings"
                className="admin-header__account"
                aria-label="Account settings"
              >
                <span className="admin-avatar" aria-hidden>
                  A
                </span>
                <span className="admin-desktop-only admin-header__name">Admin</span>
              </Link>
            </div>
          </header>

          <main className="admin-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
