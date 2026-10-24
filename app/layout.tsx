import type { Metadata } from 'next';

import { AppShell } from '@/components/app-shell';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hyperlocal Events — Find your next local thing',
    template: '%s · Hyperlocal Events',
  },
  description:
    'Discover thoughtful local events, meet your community, and make room for something nearby.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
