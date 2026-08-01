'use client';

import { useRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
};

/**
 * Minimal rich-text toolbar over a plain textarea.
 * Applies markdown-ish wrappers for bold/italic/lists/links — no heavy editor dependency.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 10,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const block = value.slice(start, end) || 'Item';
    const nextBlock = block
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join('\n');
    onChange(value.slice(0, start) + nextBlock + value.slice(end));
  };

  const insertLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (!url) return;
    wrap('[', `](${url})`);
  };

  return (
    <div className="admin-rte">
      <div className="admin-rte__toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" className="admin-rte__btn" onClick={() => wrap('**')}>
          Bold
        </button>
        <button type="button" className="admin-rte__btn" onClick={() => wrap('_')}>
          Italic
        </button>
        <button
          type="button"
          className="admin-rte__btn"
          onClick={() => prefixLines('- ')}
        >
          List
        </button>
        <button type="button" className="admin-rte__btn" onClick={insertLink}>
          Link
        </button>
        <span className="admin-rte__sep" aria-hidden />
        <button
          type="button"
          className="admin-rte__btn"
          onClick={() => onChange(value.slice(0, Math.max(0, value.length - 1)))}
          title="Undo last character"
        >
          Undo
        </button>
      </div>
      <textarea
        ref={ref}
        className="admin-textarea admin-rte__area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
