"use client";

import { TranslationProvider } from "@/lib/i18n/TranslationContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TranslationProvider>
  );
}
