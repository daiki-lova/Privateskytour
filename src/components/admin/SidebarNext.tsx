import React from 'react';
import {
  LayoutDashboard, Calendar, Clock, Users, FileText,
  Settings, LogOut, Bell, ShieldAlert, CreditCard, Activity,
  Navigation, MapPin, Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import logo from '@/assets/logo-header.png';
import { cn } from "@/components/ui/utils";
import { User } from '@/lib/data/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useRefundCandidates } from '@/lib/api/hooks/useRefunds';

interface SidebarProps {
  currentUser: User;
  onLogout?: () => void;
  className?: string;
}

const SidebarContent = ({ currentUser, onLogout }: SidebarProps) => {
  const pathname = usePathname();
  const { refundCandidates } = useRefundCandidates();
  const pendingRefundsCount = refundCandidates.length;

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard, path: '/admin/dashboard', roles: ['admin', 'staff', 'viewer'] },
    { id: 'reservations', label: '予約管理', icon: Calendar, path: '/admin/reservations', roles: ['admin', 'staff', 'viewer'] },
    { id: 'slots', label: 'スロット管理', icon: Clock, path: '/admin/slots', roles: ['admin', 'staff', 'viewer'] },
    { id: 'manifest', label: '搭乗名簿', icon: FileText, path: '/admin/manifest', roles: ['admin', 'staff', 'viewer'] },
    { id: 'customers', label: '顧客管理', icon: Users, path: '/admin/customers', roles: ['admin', 'staff', 'viewer'] },
    { id: 'notifications', label: 'お知らせ管理', icon: Bell, path: '/admin/notifications', roles: ['admin', 'staff'] },
    // CMSセクション
    { id: 'courses', label: 'コース管理', icon: Navigation, path: '/admin/courses', roles: ['admin', 'staff'] },
    { id: 'heliports', label: 'ヘリポート管理', icon: MapPin, path: '/admin/heliports', roles: ['admin', 'staff'] },
    
    { id: 'refunds', label: '未返金管理', icon: CreditCard, path: '/admin/refunds', roles: ['admin'] },
    { id: 'logs', label: '連携・ログ', icon: Activity, path: '/admin/logs', roles: ['admin'] },
    { id: 'settings', label: '設定', icon: Settings, path: '/admin/settings', roles: ['admin'] },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-slate-600">
      <div className="p-5 border-b border-slate-100">
        <img src={logo.src} alt="PrivateSky Tour" className="h-7 mb-1.5 object-contain" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">管理画面</p>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="mb-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          MAIN MENU
        </div>
        {menuItems.map((item) => {
          if (!item.roles.includes(currentUser.role)) return null;
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                  : "hover:bg-slate-50 hover:text-slate-800 text-slate-600"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
              {item.id === 'refunds' && pendingRefundsCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs px-2 py-0.5 h-5">{pendingRefundsCount}</Badge>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Button
          variant="outline"
          size="default"
          className="w-full justify-start text-sm h-10 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-800 shadow-sm"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          ログアウト
        </Button>
      </div>
    </div>
  );
};

export const SidebarNext = ({ className, ...props }: SidebarProps) => {
  return (
    <div className={cn(
      "w-64 h-screen fixed left-0 top-0 border-r border-slate-200 shadow-sm z-50 hidden lg:flex",
      className
    )}>
      <SidebarContent {...props} />
    </div>
  );
};

export const MobileNavNext = (props: SidebarProps) => {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close sidebar when clicking a link
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetTitle className="sr-only">Admin Menu</SheetTitle>
        <SheetDescription className="sr-only">Navigation menu for the admin console</SheetDescription>
        <SidebarContent {...props} />
      </SheetContent>
    </Sheet>
  );
};
