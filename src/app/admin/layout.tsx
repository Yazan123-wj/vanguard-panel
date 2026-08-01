import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/styles/admin.css';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s · Vanguard Admin',
  },
  robots: { index: false, follow: false },
};

/**
 * Admin root layout — imports scoped admin CSS only.
 * Public site chrome is hidden via body:has([data-admin]) rules.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
