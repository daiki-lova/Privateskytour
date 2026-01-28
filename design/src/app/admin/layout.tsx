"use client";

import React, { useState } from 'react';
import { SidebarNext, MobileNavNext } from "@/app/components/admin/SidebarNext";
import { User } from "@/app/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock current user
  const [currentUser] = useState<User>({
    id: "admin-1",
    name: "System Admin",
    role: "admin",
    email: "admin@privatesky.jp",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  });

  const handleLogout = () => {
    console.log("Logout triggered");
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
