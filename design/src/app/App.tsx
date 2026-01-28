import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from "@/app/admin/layout";
import DashboardPage from "@/app/admin/dashboard/page";
import ReservationsPage from "@/app/admin/reservations/page";
import SlotsPage from "@/app/admin/slots/page";
import ManifestPage from "@/app/admin/manifest/page";
import SettingsPage from "@/app/admin/settings/page";
import CustomersPage from "@/app/admin/customers/page";
import NotificationsPage from "@/app/admin/notifications/page";
import CoursesPage from "@/app/admin/courses/page";
import HeliportsPage from "@/app/admin/heliports/page";
import RefundsPage from "@/app/admin/refunds/page";
import LogsPage from "@/app/admin/logs/page";
import { LoginView } from "@/app/components/admin/LoginView";
import { Toaster } from "@/app/components/ui/sonner";
import { User } from "@/app/types";

export default function App() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Persistence for mock login
  useEffect(() => {
    const saved = localStorage.getItem('heli-admin-user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (role: 'admin' | 'staff') => {
    const user = {
      id: "admin-1",
      name: "System Admin",
      role: role,
      email: "admin@privatesky.jp",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    };
    setCurrentUser(user);
    localStorage.setItem('heli-admin-user', JSON.stringify(user));
    window.location.hash = '/admin/dashboard';
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('heli-admin-user');
    window.location.hash = '/';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LoginView onLogin={handleLogin} />
        <Toaster />
      </div>
    );
  }

  const renderPage = () => {
    switch (pathname) {
      case "/admin/dashboard": return <DashboardPage />;
      case "/admin/reservations": return <ReservationsPage />;
      case "/admin/slots": return <SlotsPage />;
      case "/admin/manifest": return <ManifestPage />;
      case "/admin/customers": return <CustomersPage />;
      case "/admin/notifications": return <NotificationsPage />;
      case "/admin/courses": return <CoursesPage />;
      case "/admin/heliports": return <HeliportsPage />;
      case "/admin/refunds": return <RefundsPage />;
      case "/admin/logs": return <LogsPage />;
      case "/admin/settings": return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AdminLayout>
      {renderPage()}
    </AdminLayout>
  );
}
