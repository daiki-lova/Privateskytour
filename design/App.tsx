import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, FileText, Settings, 
  LogOut, Bell, Search, Plus, Trash2, Edit2, 
  ChevronRight, ChevronDown, Check, X, 
  MoreHorizontal, CreditCard, AlertCircle, RefreshCw,
  Image as ImageIcon, MapPin, Clock, DollarSign,
  Menu, Globe, Eye, ArrowUp, ArrowDown, GripVertical,
  Mail, MessageSquare, List, LayoutTemplate,
  Shield, ExternalLink, Printer, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 
 * UTILITIES 
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * TYPES
 */
type Role = 'admin' | 'editor' | 'viewer';
type Status = 'published' | 'draft' | 'scheduled' | 'archived';
type Lang = 'ja' | 'en' | 'zh';

interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  pax: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'unpaid' | 'refunded' | 'failed';
  notes?: string;
}

interface Block {
  id: string;
  type: 'hero' | 'sectionHeading' | 'textImage' | 'features3' | 'gallery' | 'faqRef' | 'bulletNotes' | 'access' | 'cta' | 'newsListRef';
  data: any;
  isVisible: boolean;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  status: Status;
  template: 'staticPage' | 'coursePage' | 'newsArticle';
  updatedAt: string;
  updatedBy: string;
  blocks: Block[];
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

interface CourseData extends PageData {
  price: number;
  duration: number; // minutes
  meetingPoint: string;
  isSoldOut: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  alt: string;
  filename: string;
  size: string;
  uploadedAt: string;
}

interface LogEntry {
  id: string;
  type: 'stripe' | 'crm' | 'system';
  status: 'success' | 'failure' | 'warning';
  message: string;
  timestamp: string;
}

/**
 * MOCK DATA
 */
const CURRENT_USER: User = {
  id: 'u1',
  name: 'Admin User',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'RES-001', customerName: 'Yamada Taro', customerEmail: 'taro@ex.com', planId: 'c1', date: '2023-10-25', time: '14:00', pax: 2, price: 50000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'RES-002', customerName: 'Smith John', customerEmail: 'john@ex.com', planId: 'c2', date: '2023-10-25', time: '15:30', pax: 3, price: 120000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'RES-003', customerName: 'Suzuki Hanako', customerEmail: 'hana@ex.com', planId: 'c1', date: '2023-10-26', time: '10:00', pax: 2, price: 50000, status: 'cancelled', paymentStatus: 'refunded' },
  { id: 'RES-004', customerName: 'Lee Wei', customerEmail: 'lee@ex.com', planId: 'c3', date: '2023-10-26', time: '11:00', pax: 1, price: 80000, status: 'confirmed', paymentStatus: 'paid' },
  { id: 'RES-005', customerName: 'Tanaka Ken', customerEmail: 'ken@ex.com', planId: 'c1', date: '2023-10-27', time: '16:00', pax: 2, price: 50000, status: 'pending', paymentStatus: 'unpaid' },
];

const MOCK_PAGES: PageData[] = [
  { 
    id: 'p1', title: 'Home', slug: '/', status: 'published', template: 'staticPage', 
    updatedAt: '2023-10-24 10:00', updatedBy: 'Admin',
    blocks: [], seo: { title: 'Helicopter Tours Tokyo', description: 'Best views of Tokyo' } 
  },
  { 
    id: 'p2', title: 'About Us', slug: '/about', status: 'published', template: 'staticPage', 
    updatedAt: '2023-10-20 14:00', updatedBy: 'Editor',
    blocks: [], seo: { title: 'About Us', description: 'Our safety standards' } 
  },
];

const MOCK_COURSES: CourseData[] = [
  {
    id: 'c1', title: 'Tokyo Bay Cruiser', slug: '/courses/tokyo-bay', status: 'published', template: 'coursePage',
    updatedAt: '2023-10-01', updatedBy: 'Admin', blocks: [], seo: { title: 'Tokyo Bay Course', description: '' },
    price: 25000, duration: 15, meetingPoint: 'Tokyo Heliport', isSoldOut: false
  },
  {
    id: 'c2', title: 'Mt. Fuji Twilight', slug: '/courses/fuji-twilight', status: 'published', template: 'coursePage',
    updatedAt: '2023-10-05', updatedBy: 'Admin', blocks: [], seo: { title: 'Mt Fuji', description: '' },
    price: 120000, duration: 60, meetingPoint: 'Tokyo Heliport', isSoldOut: false
  },
  {
    id: 'c3', title: 'Night View Deluxe', slug: '/courses/night-view', status: 'draft', template: 'coursePage',
    updatedAt: '2023-10-24', updatedBy: 'Editor', blocks: [], seo: { title: 'Night View', description: '' },
    price: 45000, duration: 20, meetingPoint: 'Yokohama Heliport', isSoldOut: true
  }
];

const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', type: 'stripe', status: 'success', message: 'Webhook received: payment_intent.succeeded', timestamp: '2023-10-25 14:05:22' },
  { id: 'l2', type: 'crm', status: 'success', message: 'Customer synced: Yamada Taro', timestamp: '2023-10-25 14:05:25' },
  { id: 'l3', type: 'stripe', status: 'failure', message: 'Refund failed: RES-003 (insufficient funds)', timestamp: '2023-10-26 10:05:00' },
];

/**
 * UI COMPONENTS (Design System)
 */
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link', size?: 'sm' | 'md' | 'lg' | 'icon' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'hover:bg-slate-100 text-slate-600',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      link: 'text-indigo-600 hover:underline p-0 h-auto'
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10 p-2 flex items-center justify-center'
    };
    return (
      <button 
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )} 
        {...props} 
      />
    );
  }
);

const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' | 'outline', className?: string }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    outline: 'border border-slate-200 text-slate-600'
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', className)}>
    {children}
  </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));

const Label = ({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 mb-1.5 block", className)} {...props}>
    {children}
  </label>
);

const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-auto">
    <table className="w-full caption-bottom text-sm text-left">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b bg-slate-50/50 sticky top-0 z-10">
    {children}
  </thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
);

const TableRow = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <tr className={cn("border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100", className, onClick && "cursor-pointer")} onClick={onClick}>
    {children}
  </tr>
);

const TableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0", className)}>
    {children}
  </th>
);

const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>
    {children}
  </td>
);

const Modal = ({ isOpen, onClose, title, children, footer }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, footer?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-5",
      type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    )}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
};

/**
 * FEATURE COMPONENTS
 */

// 1. DASHBOARD
const DashboardView = () => {
  const data = [
    { name: 'Mon', sales: 40000, bookings: 2 },
    { name: 'Tue', sales: 30000, bookings: 1 },
    { name: 'Wed', sales: 20000, bookings: 1 },
    { name: 'Thu', sales: 27800, bookings: 2 },
    { name: 'Fri', sales: 189000, bookings: 5 },
    { name: 'Sat', sales: 239000, bookings: 8 },
    { name: 'Sun', sales: 349000, bookings: 10 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-slate-500">Total Revenue (Oct)</p>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">¥2,350,000</div>
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUp className="w-3 h-3 mr-1" /> +20.1% from last month
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-slate-500">Bookings</p>
            <Calendar className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">+42</div>
          <p className="text-xs text-emerald-600 flex items-center mt-1">
            <ArrowUp className="w-3 h-3 mr-1" /> +12% from last month
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-slate-500">Active Courses</p>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">6</div>
          <p className="text-xs text-slate-500 mt-1">All systems operational</p>
        </Card>
        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-slate-500">Action Required</p>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-amber-600 mt-1">1 Failed Refund, 2 Unsynced</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `¥${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="col-span-3 p-6">
          <h3 className="text-lg font-medium mb-4">Recent Reservations</h3>
          <div className="space-y-4">
            {MOCK_RESERVATIONS.slice(0, 4).map(res => (
              <div key={res.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {res.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{res.customerName}</p>
                    <p className="text-xs text-slate-500">{res.date} • {res.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">¥{res.price.toLocaleString()}</p>
                  <Badge variant={res.status === 'confirmed' ? 'success' : 'warning'}>{res.status}</Badge>
                </div>
              </div>
            ))}
            <Button variant="link" className="w-full text-sm">View all reservations</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// 2. RESERVATIONS
const ReservationsView = () => {
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    setIsProcessing(true);
    // Simulation
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    alert('Refund processed via Stripe (Simulated)');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="w-4 h-4 mr-2" /> Print Manifest</Button>
          <Button><Plus className="w-4 h-4 mr-2" /> New Booking</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search by name, email, ID..." />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_RESERVATIONS.map((res) => (
              <TableRow key={res.id} onClick={() => { setSelectedRes(res); setIsDetailOpen(true); }}>
                <TableCell className="font-mono text-xs text-slate-500">{res.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{res.customerName}</div>
                  <div className="text-xs text-slate-500">{res.customerEmail}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{res.date}</div>
                  <div className="text-xs text-slate-500">{res.time}</div>
                </TableCell>
                <TableCell>
                  {res.planId === 'c1' ? 'Tokyo Bay' : res.planId === 'c2' ? 'Mt Fuji' : 'Night View'}
                </TableCell>
                <TableCell>{res.pax}</TableCell>
                <TableCell>
                  <Badge variant={
                    res.status === 'confirmed' ? 'success' : 
                    res.status === 'cancelled' ? 'error' : 'warning'
                  }>
                    {res.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        title="Reservation Details"
        footer={
          selectedRes?.status !== 'cancelled' ? (
            <>
              <Button variant="outline" onClick={() => {}}>Reschedule</Button>
              <Button variant="destructive" onClick={handleRefund} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Cancel & Refund'}
              </Button>
            </>
          ) : null
        }
      >
        {selectedRes && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Paid</p>
                <p className="text-2xl font-bold text-slate-900">¥{selectedRes.price.toLocaleString()}</p>
              </div>
              <Badge variant={selectedRes.paymentStatus === 'paid' ? 'success' : 'error'}>
                {selectedRes.paymentStatus.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <div className="font-medium">{selectedRes.date}</div>
              </div>
              <div>
                <Label>Time</Label>
                <div className="font-medium">{selectedRes.time}</div>
              </div>
              <div>
                <Label>Course</Label>
                <div className="font-medium">{selectedRes.planId}</div>
              </div>
              <div>
                <Label>Passengers</Label>
                <div className="font-medium">{selectedRes.pax} people</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-medium mb-2">Customer Information</h4>
              <p className="text-sm">Name: {selectedRes.customerName}</p>
              <p className="text-sm">Email: {selectedRes.customerEmail}</p>
              <p className="text-sm text-slate-500 mt-2">Stripe Customer ID: cus_123456789</p>
            </div>
            
            <div className="border-t border-slate-100 pt-4">
               <h4 className="font-medium mb-2">Internal Notes</h4>
               <Input placeholder="Add notes here..." defaultValue={selectedRes.notes} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// 3. SLOTS / CALENDAR
const SlotsView = () => {
  // Simple Mock Grid
  const times = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Slot Management</h1>
        <div className="flex gap-2">
           <Button variant="secondary">Bulk Edit</Button>
           <Button variant="destructive">Stop Sales (Emergency)</Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left min-w-[100px] border-b">Time \ Date</th>
                {dates.map(date => (
                  <th key={date} className="p-4 font-medium border-b min-w-[100px]">
                    {date.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map(time => (
                <tr key={time} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-left bg-slate-50/30">{time}</td>
                  {dates.map(date => {
                    const isBooked = Math.random() > 0.8;
                    const isClosed = Math.random() > 0.9;
                    return (
                      <td key={`${date}-${time}`} className="p-2 border-l">
                         <button 
                           className={cn(
                             "w-full h-10 rounded text-xs font-medium transition-colors",
                             isClosed ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                             isBooked ? "bg-red-50 text-red-700 border border-red-200" :
                             "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                           )}
                         >
                           {isClosed ? 'CLOSED' : isBooked ? 'FULL' : 'OPEN (3)'}
                         </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// 4. CMS Editor (Complex)
const BlockEditor = ({ blocks, onChange }: { blocks: Block[], onChange: (b: Block[]) => void }) => {
  const moveBlock = (index: number, direction: -1 | 1) => {
    const newBlocks = [...blocks];
    if (index + direction < 0 || index + direction >= newBlocks.length) return;
    [newBlocks[index], newBlocks[index + direction]] = [newBlocks[index + direction], newBlocks[index]];
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data: {},
      isVisible: true
    };
    onChange([...blocks, newBlock]);
  };

  const renderBlockInput = (block: Block, index: number) => {
    // Simplified rendering of fields based on type
    const commonHeader = (
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <span className="font-semibold text-sm uppercase tracking-wider text-slate-500">{block.type}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => moveBlock(index, -1)}><ArrowUp className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => moveBlock(index, 1)}><ArrowDown className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBlock(index)}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    );

    return (
      <Card key={block.id} className="p-4 mb-4 border-l-4 border-l-indigo-500">
        {commonHeader}
        <div className="space-y-4">
          {block.type === 'hero' && (
             <>
               <div><Label>Title</Label><Input defaultValue={block.data.title} placeholder="Hero Title" /></div>
               <div><Label>Subtitle</Label><Input defaultValue={block.data.subtitle} placeholder="Subtitle" /></div>
               <div><Label>Image URL</Label><Input defaultValue={block.data.image} placeholder="https://..." /></div>
             </>
          )}
          {block.type === 'sectionHeading' && (
             <>
               <div><Label>Title</Label><Input defaultValue={block.data.title} /></div>
               <div><Label>Description</Label><Input defaultValue={block.data.description} /></div>
             </>
          )}
          {/* Add other block types here... */}
          {!['hero', 'sectionHeading'].includes(block.type) && (
            <div className="p-4 bg-slate-50 rounded text-sm text-slate-500 text-center italic">
              Fields for {block.type} would appear here...
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {blocks.map((block, i) => renderBlockInput(block, i))}
      </div>
      
      <div className="flex gap-2 flex-wrap p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 justify-center">
        <p className="w-full text-center text-xs text-slate-500 mb-2">Add Content Block</p>
        {['Hero', 'SectionHeading', 'TextImage', 'Features3', 'Gallery', 'Access', 'CTA', 'FAQRef'].map(type => (
          <Button key={type} size="sm" variant="outline" onClick={() => addBlock(type.toLowerCase() as any)}>
            <Plus className="w-3 h-3 mr-1" /> {type}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PreviewPane = ({ blocks }: { blocks: Block[] }) => {
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden h-full flex flex-col">
      <div className="bg-slate-100 p-2 border-b flex justify-between items-center text-xs text-slate-500">
        <span>Next.js Preview Mode</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-white p-8">
         {/* Simulate rendering */}
         <div className="max-w-3xl mx-auto space-y-12">
            {blocks.length === 0 && <div className="text-center text-slate-300 py-20">Empty Page Content</div>}
            {blocks.map(b => (
              <div key={b.id} className="border-2 border-dashed border-transparent hover:border-indigo-200 transition-colors rounded p-2 relative group">
                 <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">
                   {b.type} component
                 </div>
                 
                 {/* Mock Component Rendering */}
                 {b.type === 'hero' && (
                   <div className="h-48 bg-slate-100 rounded flex flex-col items-center justify-center text-center p-4">
                     <h1 className="text-3xl font-bold text-slate-900">{b.data.title || 'Hero Title'}</h1>
                     <p className="text-slate-600 mt-2">{b.data.subtitle || 'Subtitle goes here'}</p>
                     <button className="mt-4 bg-black text-white px-4 py-2 rounded text-sm">CTA Button</button>
                   </div>
                 )}
                 {b.type === 'sectionHeading' && (
                   <div className="text-center">
                     <h2 className="text-2xl font-bold text-slate-900">{b.data.title || 'Section Title'}</h2>
                     <p className="text-slate-600 max-w-lg mx-auto mt-2">{b.data.description || 'Description text...'}</p>
                   </div>
                 )}
                 {!['hero', 'sectionHeading'].includes(b.type) && (
                   <div className="h-24 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                     [{b.type} placeholder]
                   </div>
                 )}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const CMSEditor = ({ pageId, onBack }: { pageId: string | null, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b1', type: 'hero', data: { title: 'Experience Tokyo From Above' }, isVisible: true },
    { id: 'b2', type: 'sectionHeading', data: { title: 'Our Premium Courses' }, isVisible: true }
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronDown className="w-5 h-5 rotate-90" /></Button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {pageId ? 'Edit Page: Home' : 'New Page'}
              <Badge variant="outline">Draft</Badge>
            </h2>
            <div className="flex gap-2 text-xs text-slate-500">
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> slug: /home</span>
              <span>•</span>
              <span>Last saved: 2 min ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 rounded-lg p-1 mr-4">
             <button className="px-3 py-1 text-sm font-medium rounded-md bg-white shadow-sm text-slate-900">Japanese</button>
             <button className="px-3 py-1 text-sm font-medium rounded-md text-slate-500 hover:text-slate-900">English</button>
           </div>
           <Button variant="outline" onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
             {isPreviewOpen ? <LayoutTemplate className="w-4 h-4 mr-2"/> : <Eye className="w-4 h-4 mr-2"/>}
             {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
           </Button>
           <Button>Save Changes</Button>
           <Button variant="ghost" className="text-indigo-600">Publish</Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Settings/Blocks */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-[500px]">
           <div className="flex border-b border-slate-200 mb-4">
             {['content', 'seo', 'settings'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={cn(
                   "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                   activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
                 )}
               >
                 {tab.charAt(0).toUpperCase() + tab.slice(1)}
               </button>
             ))}
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2">
             {activeTab === 'content' && <BlockEditor blocks={blocks} onChange={setBlocks} />}
             {activeTab === 'seo' && (
               <div className="space-y-4 max-w-xl">
                 <div><Label>Meta Title</Label><Input defaultValue="Helicopter Tours Tokyo" /></div>
                 <div><Label>Meta Description</Label><textarea className="w-full border rounded-md p-2 text-sm" rows={4} defaultValue="Best views..." /></div>
                 <div><Label>OG Image</Label><div className="h-32 bg-slate-100 rounded flex items-center justify-center border border-dashed border-slate-300">Upload Image</div></div>
               </div>
             )}
           </div>
        </div>

        {/* Right: Preview */}
        {isPreviewOpen && (
          <div className="flex-1 hidden lg:block bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
            <div className="absolute inset-4">
              <PreviewPane blocks={blocks} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. SETTINGS / DESIGN SYSTEM
const DesignSystemView = () => (
  <div className="space-y-8 max-w-4xl">
    <h1 className="text-3xl font-bold">Design System</h1>
    
    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Buttons</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Badges</h2>
      <div className="flex gap-4">
        <Badge variant="default">Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Form Elements</h2>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Input Field</Label><Input placeholder="Placeholder text" /></div>
        <div><Label>Disabled Input</Label><Input disabled placeholder="Cannot type here" /></div>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">Cards & Layout</h2>
      <Card className="p-6">
        <h3 className="font-bold text-lg">Card Title</h3>
        <p className="text-slate-600">This is a standard card component used throughout the admin dashboard.</p>
      </Card>
    </section>
  </div>
);

/**
 * MAIN APP SHELL
 */
export default function HelicoAdminApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  // Trigger a welcome toast
  useEffect(() => {
    setShowNotification(true);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservations', label: 'Reservations', icon: Calendar },
    { id: 'slots', label: 'Slot Management', icon: Clock },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'logs', label: 'Integration Logs', icon: Shield },
    { type: 'divider' },
    { id: 'pages', label: 'Pages', icon: FileText, group: 'CMS' },
    { id: 'courses', label: 'Courses', icon: MapPin, group: 'CMS' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, group: 'CMS' },
    { type: 'divider' },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'design', label: 'Design System', icon: LayoutTemplate },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {showNotification && <Toast message="Welcome back, Admin" onClose={() => setShowNotification(false)} />}

      {/* SIDEBAR */}
      <aside className={cn(
        "bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 fixed md:relative z-20 h-full",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
               <span className="text-white font-bold text-lg">H</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-white tracking-wide">HELI<span className="text-indigo-400">ADMIN</span></span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item, idx) => (
            item.type === 'divider' ? (
              <div key={idx} className="my-4 border-t border-slate-800" />
            ) : (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id!)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  currentView === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                {isSidebarOpen && <span>{item.label}</span>}
                {isSidebarOpen && item.group && <span className="ml-auto text-[10px] uppercase font-bold text-slate-600 tracking-wider">{item.group}</span>}
              </button>
            )
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <img src={CURRENT_USER.avatar} alt="User" className="w-8 h-8 rounded-full bg-slate-700" />
            {isSidebarOpen && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-slate-500 capitalize">{CURRENT_USER.role}</p>
              </div>
            )}
            {isSidebarOpen && <LogOut className="w-4 h-4 ml-auto text-slate-500" />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md text-slate-500">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-slate-700 capitalize">{currentView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
            <a href="#" target="_blank" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View Live Site <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'reservations' && <ReservationsView />}
            {currentView === 'slots' && <SlotsView />}
            {currentView === 'pages' && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h1 className="text-2xl font-bold">Pages</h1>
                  <Button onClick={() => setCurrentView('page-editor-new')}><Plus className="w-4 h-4 mr-2" /> New Page</Button>
                </div>
                <Card>
                  <Table>
                    <TableHeader>
                       <TableRow><TableHead>Title</TableHead><TableHead>Slug</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PAGES.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.title}</TableCell>
                          <TableCell className="text-slate-500 font-mono text-xs">{p.slug}</TableCell>
                          <TableCell><Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge></TableCell>
                          <TableCell className="text-slate-500 text-xs">{p.updatedAt} by {p.updatedBy}</TableCell>
                          <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setCurrentView('page-editor-edit')}>Edit</Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
            {(currentView === 'page-editor-new' || currentView === 'page-editor-edit') && (
              <CMSEditor pageId={currentView === 'page-editor-edit' ? '1' : null} onBack={() => setCurrentView('pages')} />
            )}
            {currentView === 'design' && <DesignSystemView />}
            {/* Fallback for other views */}
            {!['dashboard', 'reservations', 'slots', 'pages', 'page-editor-new', 'page-editor-edit', 'design'].includes(currentView) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <LayoutTemplate className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Work in Progress</h3>
                <p>The {currentView} view is currently under development.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
