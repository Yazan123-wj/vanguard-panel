'use client';

import Link from 'next/link';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { IconClose } from '@/components/admin/icons';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="admin-header__right">{actions}</div> : null}
    </header>
  );
}

export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`admin-card ${padded ? 'admin-card__pad' : ''} ${className}`}>
      {children}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
};

function btnClass(
  variant: BtnProps['variant'] = 'primary',
  size: BtnProps['size'] = 'md',
  className = '',
) {
  const sizeClass =
    size === 'sm' ? 'admin-btn--sm' : size === 'icon' ? 'admin-btn--icon' : '';
  return `admin-btn admin-btn--${variant} ${sizeClass} ${className}`;
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'md', className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={btnClass(variant, size, className)}
      {...props}
    />
  );
});

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  style,
  children,
}: {
  href: string;
  variant?: BtnProps['variant'];
  size?: BtnProps['size'];
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={btnClass(variant, size, className)} style={style}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'accent' | 'info';
}) {
  return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="admin-field">
      <span className="admin-label">{label}</span>
      {children}
      {hint && !error ? <span className="admin-help">{hint}</span> : null}
      {error ? (
        <span className="admin-help" style={{ color: 'var(--admin-error)' }}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className = '', invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`admin-input ${invalid ? 'is-error' : ''} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className = '', invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`admin-textarea ${invalid ? 'is-error' : ''} ${className}`}
      {...props}
    />
  );
});

export function Select({
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`admin-select ${className}`} {...props}>
      {children}
    </select>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty admin-card">
      <h3 className="admin-empty__title">{title}</h3>
      <p className="admin-empty__desc">{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'published'
      ? 'success'
      : status === 'draft'
        ? 'warning'
        : status === 'scheduled'
          ? 'info'
          : 'neutral';
  return (
    <Badge tone={tone}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function Modal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-modal-title" className="admin-modal__title">
          {title}
        </h2>
        <p className="admin-modal__body">{body}</p>
        <div className="admin-modal__actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Larger dialog shell for create/edit forms (not just confirmations). */
export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: 'md' | 'lg';
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`admin-dialog admin-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog__header">
          <div>
            <h2 id="admin-dialog-title" className="admin-dialog__title">
              {title}
            </h2>
            {description ? (
              <p className="admin-dialog__desc">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            <IconClose />
          </Button>
        </div>
        <div className="admin-dialog__body">{children}</div>
        {footer ? <div className="admin-dialog__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="admin-toast" role="status">
      <span style={{ flex: 1 }}>{message}</span>
      <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={onClose}>
        <IconClose />
      </Button>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="admin-stack">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="admin-skeleton"
          style={{ height: 56, width: '100%' }}
        />
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="admin-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="admin-switch__track" aria-hidden />
      <span className="admin-switch__label">{label}</span>
    </label>
  );
}
