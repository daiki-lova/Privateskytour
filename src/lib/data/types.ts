// ============================================================
// PRIVATESKY TOUR Type Definitions
// ============================================================

// ============================================================
// ENUM TYPES
// ============================================================

export type UserRole = 'admin' | 'staff' | 'viewer';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'suspended';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund' | 'unpaid';
export type SupportedLang = 'ja' | 'en' | 'zh';
export type SlotStatus = 'open' | 'closed' | 'suspended';
export type CourseType = 'standard' | 'premium' | 'charter';
export type CourseCategory = 'sightseeing' | 'transfer';
export type LogType = 'stripe' | 'crm' | 'system' | 'operation' | 'auth';
export type LogStatus = 'success' | 'failure' | 'warning' | 'info';
export type NotificationType = 'booking_confirmation' | 'payment_received' | 'reminder' | 'cancellation' | 'refund' | 'custom';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type RefundReason = 'customer_request' | 'weather' | 'mechanical' | 'operator_cancel' | 'other';
export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Legacy type aliases for backward compatibility
export type Role = UserRole;
export type Status = ReservationStatus;
export type Lang = SupportedLang;

// ============================================================
// CORE ENTITIES
// ============================================================

export interface Heliport {
  id: string;
  name: string;
  nameEn?: string;
  nameZh?: string;
  postalCode?: string;
  address?: string;
  addressEn?: string;
  addressZh?: string;
  accessRail?: string;
  accessTaxi?: string;
  accessCar?: string;
  googleMapUrl?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  heliportId?: string;
  title: string;
  titleEn?: string;
  titleZh?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleZh?: string;
  description?: string;
  descriptionEn?: string;
  descriptionZh?: string;
  courseType?: CourseType;
  durationMinutes?: number;
  price: number;
  maxPax?: number;
  minPax?: number;
  tags?: string[];
  images?: string[];
  flightSchedule?: FlightScheduleItem[];
  highlights?: string[];
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;

  // LP display fields
  category?: CourseCategory;
  area?: string;
  rating?: number;
  popular?: boolean;
  routeMapUrl?: string;
  returnPrice?: number;

  // Legacy alias (backward compatibility)
  duration?: number; // Alias for durationMinutes

  // Joined data
  heliport?: Heliport;
}

export interface FlightScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface Slot {
  id: string;
  courseId?: string;
  slotDate?: string; // YYYY-MM-DD
  slotTime?: string; // HH:mm
  maxPax: number;
  currentPax: number;
  status: SlotStatus;
  suspendedReason?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy aliases (backward compatibility) - required for mock data
  date: string; // Alias for slotDate
  time: string; // Alias for slotTime
  reason?: string; // Alias for suspendedReason

  // Computed
  availablePax?: number;

  // Joined data
  course?: Course;
  reservations?: (Reservation | string)[];
}

// ============================================================
// USER ENTITIES
// ============================================================

export interface Customer {
  id: string;
  email: string;
  name: string;
  nameKana?: string;
  phone?: string;
  preferredLang?: SupportedLang;
  totalSpent: number;
  bookingCount: number;
  firstBookingDate?: string;
  lastBookingDate?: string;
  notes?: string;
  tags?: string[];
  mypageToken?: string;
  mypageTokenExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy alias (backward compatibility)
  lang?: SupportedLang; // Alias for preferredLang
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy User type for backward compatibility
export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
}

// ============================================================
// BOOKING ENTITIES
// ============================================================

export interface Reservation {
  id: string;
  bookingNumber: string;
  customerId: string;
  courseId?: string;
  slotId?: string;
  reservationDate?: string; // YYYY-MM-DD
  reservationTime?: string; // HH:mm
  pax: number;
  subtotal?: number;
  tax?: number;
  totalPrice?: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;

  // Health & consent
  healthConfirmed?: boolean;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;

  // Cancellation tracking
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  cancellationFee?: number;

  // Notes
  customerNotes?: string;
  adminNotes?: string;

  // Metadata
  bookedVia?: string;
  ipAddress?: string;
  userAgent?: string;

  createdAt?: string;
  updatedAt?: string;

  // Legacy aliases (backward compatibility with mock data / admin views)
  planId?: string; // Alias for courseId
  date: string; // Alias for reservationDate (required for legacy)
  time: string; // Alias for reservationTime (required for legacy)
  price: number; // Alias for totalPrice (required for legacy)
  notes?: string; // Alias for customerNotes
  weight?: number; // Legacy - now tracked per passenger
  customerName?: string; // Denormalized from customer
  customerEmail?: string; // Denormalized from customer
  customerPhone?: string; // Denormalized from customer
  customerLang?: SupportedLang; // Denormalized from customer
  planName?: string; // Denormalized from course
  bookedAt?: string; // Alias for createdAt
  suspendedAt?: string; // Legacy status tracking
  refundedAmount?: number; // Calculated from refunds
  refundedAt?: string; // Calculated from refunds
  refundedBy?: string; // Calculated from refunds
  stripePaymentId?: string; // Alias for stripePaymentIntentId

  // Joined data
  customer?: Customer;
  course?: Course;
  slot?: Slot;
  passengers?: Passenger[];
  payments?: Payment[];
}

export interface Passenger {
  id: string;
  reservationId: string;
  name: string;
  nameKana?: string;
  nameRomaji?: string;
  weightKg?: number;
  isChild: boolean;
  isInfant: boolean;
  seatNumber?: number;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// PAYMENT ENTITIES
// ============================================================

export interface Payment {
  id: string;
  reservationId: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  cardLast4?: string;
  cardBrand?: string;
  receiptUrl?: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Joined data
  reservation?: Reservation;
  refunds?: Refund[];
}

export interface Refund {
  id: string;
  paymentId: string;
  reservationId: string;
  stripeRefundId?: string;
  amount: number;
  reason: RefundReason;
  reasonDetail?: string;
  processedBy?: string;
  processedAt?: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Joined data
  payment?: Payment;
  reservation?: Reservation;
  processedByUser?: AdminUser;
}

export interface CancellationPolicy {
  id: string;
  name: string;
  daysBefore: number;
  feePercentage: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// NOTIFICATION ENTITIES
// ============================================================

export interface Notification {
  id: string;
  reservationId?: string;
  customerId?: string;
  notificationType: NotificationType;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  lang: SupportedLang;
  status: NotificationStatus;
  scheduledAt: string;
  sentAt?: string;
  failedAt?: string;
  failureReason?: string;
  resendMessageId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// SYSTEM ENTITIES
// ============================================================

export interface SystemSetting {
  id: string;
  key: string;
  value: Record<string, unknown> | string | number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  lang: SupportedLang;
  status: InquiryStatus;
  assignedTo?: string;
  resolvedAt?: string;
  response?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;

  // Joined data
  assignedToUser?: AdminUser;
}

export interface AlphardTransfer {
  id: string;
  reservationId?: string;
  customerId?: string;
  pickupLocation: string;
  pickupDatetime: string;
  dropoffLocation?: string;
  passengers: number;
  status: TransferStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Joined data
  reservation?: Reservation;
  customer?: Customer;
  approvedByUser?: AdminUser;
}

export interface AuditLog {
  id: string;
  logType: LogType;
  action: string;
  status: LogStatus;
  message?: string;
  userId?: string;
  userEmail?: string;
  targetTable?: string;
  targetId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Legacy LogEntry type for backward compatibility
export interface LogEntry {
  id: string;
  type: LogType;
  action: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  timestamp: string;
  user?: string;
  targetId?: string;
}

// ============================================================
// NEWS TEMPLATE (Legacy)
// ============================================================

export interface NewsTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lang: SupportedLang;
}

// ============================================================
// FORM / INPUT TYPES
// ============================================================

export interface CreateReservationInput {
  courseId: string;
  slotId: string;
  reservationDate: string;
  reservationTime: string;
  customer: {
    email: string;
    name: string;
    nameKana?: string;
    phone?: string;
    preferredLang?: SupportedLang;
  };
  passengers: {
    name: string;
    nameKana?: string;
    weightKg?: number;
    isChild?: boolean;
    isInfant?: boolean;
  }[];
  customerNotes?: string;
  healthConfirmed: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface CreateContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  lang?: SupportedLang;
}

export interface CreateAlphardTransferInput {
  reservationId?: string;
  pickupLocation: string;
  pickupDatetime: string;
  dropoffLocation?: string;
  passengers?: number;
  notes?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// DASHBOARD / ANALYTICS TYPES
// ============================================================

export interface DashboardStats {
  todayReservations: number;
  todayRevenue: number;
  monthReservations: number;
  monthRevenue: number;
  pendingInquiries: number;
  upcomingFlights: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  reservations: number;
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  reservations: number;
  revenue: number;
  averageRating?: number;
}
