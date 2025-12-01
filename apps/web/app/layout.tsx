import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@aibos/ui/design/globals.css';

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Next.js application',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

