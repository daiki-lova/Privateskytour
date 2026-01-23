export type Role = 'admin' | 'staff' | 'viewer';
export type Status = 'confirmed' | 'pending' | 'cancelled' | 'suspended' | 'completed';
export type PaymentStatus = 'paid' | 'unpaid' | 'refunded' | 'failed';
export type Lang = 'ja' | 'en' | 'zh';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lang: Lang;
  totalSpent: number;
  bookingCount: number;
  lastBookingDate: string;
  firstBookingDate: string;
  notes: string;
  tags: string[];
}

export interface Reservation {
  id: string;
  bookingNumber: string; // 表示用ID
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLang?: Lang;
  planId: string;
  planName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  pax: number;
  price: number;
  status: Status;
  paymentStatus: PaymentStatus;
  stripePaymentId?: string;
  bookedAt?: string;
  notes?: string;
  weight?: number; // kg
  refundedAmount?: number;
  refundedAt?: string;
  refundedBy?: string;
  suspendedAt?: string;
}

export interface Slot {
  id: string;
  date: string;
  time: string;
  maxPax: number;
  currentPax: number;
  status: 'open' | 'closed' | 'suspended'; // closed=売止, suspended=運休
  reservations: string[]; // Reservation IDs
  reason?: string;
}

export interface LogEntry {
  id: string;
  type: 'stripe' | 'crm' | 'system' | 'operation';
  action: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  timestamp: string;
  user?: string;
  targetId?: string;
}

export interface NewsTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lang: Lang;
}

export interface Course {
  id: string;
  title: string;
  duration: number;
  price: number;
  // 以下拡張フィールド
  subtitle?: string;
  description?: string;
  maxPax?: number;
  heliportId?: string;
  tags?: string[];
  images?: string[];
  flightSchedule?: { time: string; title: string; description: string }[];
}

export interface Heliport {
  id: string;
  name: string;
  postalCode: string;
  address: string;
  accessRail?: string;
  accessTaxi?: string;
  accessCar?: string;
  googleMapUrl: string;
  imageUrl: string;
}
