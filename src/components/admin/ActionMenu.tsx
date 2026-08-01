'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { IconMore } from '@/components/admin/icons';

export type ActionMenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
};

export function ActionMenu({ items, label = 'Actions' }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="admin-menu" ref={rootRef}>
      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <IconMore />
      </button>
      {open ? (
        <div className="admin-menu__panel" role="menu" id={menuId}>
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className={`admin-menu__item ${item.danger ? 'is-danger' : ''}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`admin-menu__item ${item.danger ? 'is-danger' : ''}`}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
