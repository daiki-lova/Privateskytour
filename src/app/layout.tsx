import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'ヘリフロント | プライベートスカイツアー',
  description: 'ヘリコプターで空の旅を。プライベートスカイツアーで特別な体験を。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
