import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scientific Production Portal',
  description: 'Public portal for researchers, projects, and scientific productions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
