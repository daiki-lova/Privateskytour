import React from 'react';
import { Toaster } from "@/app/components/ui/sonner";
import "@/styles/index.css";
import "@/styles/theme.css";
import "@/styles/fonts.css";
import "@/styles/tailwind.css";

export const metadata = {
  title: 'Helicopter Ops Admin',
  description: 'Manage helicopter sightseeing flights and reservations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
