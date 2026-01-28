"use client";

import React, { useState } from "react";
import { Sidebar, AdminViewType } from "@/app/components/admin/Sidebar";
import { DashboardView as DashboardPage } from "@/app/components/admin/DashboardView";
import { ReservationsView as ReservationsPage } from "@/app/components/admin/ReservationsView";
import { SlotsView as SlotsPage } from "@/app/components/admin/SlotsView";
import { ManifestView as ManifestPage } from "@/app/components/admin/ManifestView";
import { NotificationsView as NotificationsPage } from "@/app/components/admin/NotificationsView";
import { CoursesView as CoursesPage } from "@/app/components/admin/CoursesView";
import { HeliportsView as HeliportsPage } from "@/app/components/admin/HeliportsView";
import { 
  CustomersView as CustomersPage, 
  RefundsView as RefundsPage, 
  LogsView as LogsPage,
  SettingsView as SettingsPage
} from "@/app/components/admin/OtherViews";
import { Toaster } from "@/app/components/ui/sonner";
import { User } from "@/app/types";

export default function App() {
  const [currentView, setCurrentView] = useState<AdminViewType>("dashboard");

  // Mock user for the admin interface
  const currentUser: User = {
    id: "admin-1",
    name: "System Admin",
    role: "admin",
    email: "admin@privatesky.jp",
    avatar: "",
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage />;
      case "reservations":
        return <ReservationsPage currentUser={currentUser} />;
      case "slots":
        return <SlotsPage currentUser={currentUser} />;
      case "manifest":
        return <ManifestPage />;
      case "customers":
        return <CustomersPage />;
      case "notifications":
        return <NotificationsPage />;
      case "courses":
        return <CoursesPage />;
      case "heliports":
        return <HeliportsPage />;
      case "refunds":
        return <RefundsPage />;
      case "logs":
        return <LogsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        currentUser={currentUser}
        activeView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={() => console.log("Logout")}
      />
      
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden lg:pl-64">
        {/* Mobile Header Placeholder */}
        <div className="md:hidden p-4 bg-slate-900 text-white flex items-center justify-between shadow-sm sticky top-0 z-10">
           <h1 className="font-bold text-lg">Helicopter Ops</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {renderView()}
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}
