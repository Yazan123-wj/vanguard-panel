import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { fontBody } from '@/styles/fonts';

export const metadata: Metadata = {
  title: 'Vanguard Admin',
  robots: { index: false, follow: false },
};

/**
 * Root layout for the standalone panel app.
 * Only exposes the body font variable that admin.css reads; all panel
 * styling lives in the scoped /admin layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontBody.variable} h-full`}>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
