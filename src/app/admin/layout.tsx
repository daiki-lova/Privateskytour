"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SWRConfig } from 'swr';
import { SidebarNext, MobileNavNext } from "@/components/admin/SidebarNext";
import { useAuth, AuthProvider } from "@/components/providers/AuthProvider";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Login page - no sidebar, just render children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // User for sidebar (use auth user or fallback)
  const currentUser = {
    id: user?.id ?? "guest",
    name: user?.name ?? "Guest",
    role: user?.role ?? "staff" as const,
    email: user?.email ?? "",
    avatar: user?.avatarUrl ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <SidebarNext
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <h1 className="font-bold text-lg text-slate-900">Helicopter Ops</h1>
          <MobileNavNext currentUser={currentUser} onLogout={handleLogout} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          dedupingInterval: 5000,
          errorRetryCount: 3,
        }}
      >
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SWRConfig>
    </AuthProvider>
  );
}
