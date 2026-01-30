import React from 'react';
import {
  LayoutDashboard, Calendar, Clock, Users, FileText,
  Settings, LogOut, Bell, CreditCard, Activity,
  Navigation, MapPin, Menu
} from 'lucide-react';
import Image from 'next/image';
import logo from '@/assets/logo-header.png';
import { cn } from "@/components/ui/utils";
import { User } from '@/lib/data/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export type AdminViewType = 'dashboard' | 'reservations' | 'slots' | 'manifest' | 'customers' | 'notifications' | 'courses' | 'heliports' | 'refunds' | 'logs' | 'settings';

interface SidebarProps {
  currentUser: User;
  activeView: AdminViewType;
  onChangeView: (view: AdminViewType) => void;
  onLogout: () => void;
  className?: string;
}

const SidebarContent = ({ currentUser, activeView, onChangeView, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard, roles: ['admin', 'staff', 'viewer'] },
    { id: 'reservations', label: '予約管理', icon: Calendar, roles: ['admin', 'staff', 'viewer'] },
    { id: 'slots', label: 'スロット管理', icon: Clock, roles: ['admin', 'staff', 'viewer'] },
    { id: 'manifest', label: '搭乗名簿', icon: FileText, roles: ['admin', 'staff', 'viewer'] },
    { id: 'customers', label: '顧客管理', icon: Users, roles: ['admin', 'staff', 'viewer'] },
    { id: 'notifications', label: 'お知らせ管理', icon: Bell, roles: ['admin', 'staff'] },
    // CMSセクション
    { id: 'courses', label: 'コース管理', icon: Navigation, roles: ['admin', 'staff'] },
    { id: 'heliports', label: 'ヘリポート管理', icon: MapPin, roles: ['admin', 'staff'] },
    
    { id: 'refunds', label: '未返金管理', icon: CreditCard, roles: ['admin'] },
    { id: 'logs', label: '連携・ログ', icon: Activity, roles: ['admin'] },
    { id: 'settings', label: '設定', icon: Settings, roles: ['admin'] },
  ];

  return (
    <div className="flex flex-col h-full bg-white text-slate-500">
      <div className="p-6 border-b border-slate-100">
        <Image src={logo} alt="PrivateSky Tour" height={24} className="h-6 mb-1 object-contain -ml-1" />
        <p className="text-xs text-slate-400 font-medium">管理画面</p>
      </div>

      <div className="flex-1 py-6 px-3 space-y-0.5 overflow-y-auto">
        <div className="mb-2 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {menuItems.map((item) => {
          if (!item.roles.includes(currentUser.role)) return null;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as AdminViewType)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                activeView === item.id 
                  ? "bg-slate-100 text-slate-900 shadow-sm" 
                  : "hover:bg-slate-50 hover:text-slate-700 text-slate-500"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
              {item.id === 'refunds' && (
                <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-4">2</Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start text-xs h-8 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-700 shadow-sm"
          onClick={onLogout}
        >
          <LogOut className="w-3 h-3 mr-2" />
          ログアウト
        </Button>
      </div>
    </div>
  );
};

export const Sidebar = ({ className, ...props }: SidebarProps) => {
  return (
    <div className={cn(
      "w-64 h-screen fixed left-0 top-0 border-r border-slate-200 shadow-sm z-50 hidden lg:flex",
      className
    )}>
      <SidebarContent {...props} />
    </div>
  );
};

export const MobileNav = (props: SidebarProps) => {
  const [open, setOpen] = React.useState(false);

  // Close sidebar when clicking a link
  const handleViewChange = (view: AdminViewType) => {
    props.onChangeView(view);
    setOpen(false);
  };

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
        <SidebarContent {...props} onChangeView={handleViewChange} />
      </SheetContent>
    </Sheet>
  );
};
