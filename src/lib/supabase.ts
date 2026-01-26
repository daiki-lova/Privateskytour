import { createClient } from '@/lib/supabase/client';
import type {
  Course,
  Slot,
  Customer,
  Reservation,
  Passenger,
  Payment,
  Heliport,
  CancellationPolicy,
  ContactInquiry,
  AlphardTransfer,
  CreateReservationInput,
  CreateContactInquiryInput,
  CreateAlphardTransferInput,
  SupportedLang,
} from '@/lib/data/types';

// ============================================================
// Configuration Check
// ============================================================

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url !== 'https://placeholder.supabase.co' && url !== 'YOUR_SUPABASE_URL' && url !== 'your-supabase-url';
}

// ============================================================
// Type Converters (snake_case to camelCase)
// ============================================================

function toHeliport(row: Record<string, unknown>): Heliport {
  return {
    id: row.id as string,
    name: row.name as string,
    nameEn: row.name_en as string | undefined,
    nameZh: row.name_zh as string | undefined,
    postalCode: row.postal_code as string | undefined,
    address: row.address as string,
    addressEn: row.address_en as string | undefined,
    addressZh: row.address_zh as string | undefined,
    accessRail: row.access_rail as string | undefined,
    accessTaxi: row.access_taxi as string | undefined,
    accessCar: row.access_car as string | undefined,
    googleMapUrl: row.google_map_url as string | undefined,
    imageUrl: row.image_url as string | undefined,
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    heliportId: row.heliport_id as string | undefined,
    title: row.title as string,
    titleEn: row.title_en as string | undefined,
    titleZh: row.title_zh as string | undefined,
    subtitle: row.subtitle as string | undefined,
    subtitleEn: row.subtitle_en as string | undefined,
    subtitleZh: row.subtitle_zh as string | undefined,
    description: row.description as string | undefined,
    descriptionEn: row.description_en as string | undefined,
    descriptionZh: row.description_zh as string | undefined,
    courseType: row.course_type as Course['courseType'],
    durationMinutes: row.duration_minutes as number,
    price: row.price as number,
    maxPax: row.max_pax as number,
    minPax: row.min_pax as number,
    tags: row.tags as string[] | undefined,
    images: row.images as string[] | undefined,
    flightSchedule: row.flight_schedule as Course['flightSchedule'],
    highlights: row.highlights as string[] | undefined,
    isActive: row.is_active as boolean,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toSlot(row: Record<string, unknown>): Slot {
  return {
    id: row.id as string,
    courseId: row.course_id as string | undefined,
    slotDate: row.slot_date as string,
    slotTime: row.slot_time as string,
    maxPax: row.max_pax as number,
    currentPax: row.current_pax as number,
    status: row.status as Slot['status'],
    suspendedReason: row.suspended_reason as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    availablePax: (row.max_pax as number) - (row.current_pax as number),
    // Legacy aliases for backward compatibility
    date: row.slot_date as string,
    time: row.slot_time as string,
    reason: row.suspended_reason as string | undefined,
  };
}

function toCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    nameKana: row.name_kana as string | undefined,
    phone: row.phone as string | undefined,
    preferredLang: row.preferred_lang as SupportedLang,
    totalSpent: row.total_spent as number,
    bookingCount: row.booking_count as number,
    firstBookingDate: row.first_booking_date as string | undefined,
    lastBookingDate: row.last_booking_date as string | undefined,
    notes: row.notes as string | undefined,
    tags: row.tags as string[] | undefined,
    mypageToken: row.mypage_token as string | undefined,
    mypageTokenExpiresAt: row.mypage_token_expires_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toReservation(row: Record<string, unknown>): Reservation {
  return {
    id: row.id as string,
    bookingNumber: row.booking_number as string,
    customerId: row.customer_id as string,
    courseId: row.course_id as string,
    slotId: row.slot_id as string,
    reservationDate: row.reservation_date as string,
    reservationTime: row.reservation_time as string,
    pax: row.pax as number,
    subtotal: row.subtotal as number,
    tax: row.tax as number,
    totalPrice: row.total_price as number,
    status: row.status as Reservation['status'],
    paymentStatus: row.payment_status as Reservation['paymentStatus'],
    stripePaymentIntentId: row.stripe_payment_intent_id as string | undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id as string | undefined,
    healthConfirmed: row.health_confirmed as boolean,
    termsAccepted: row.terms_accepted as boolean,
    privacyAccepted: row.privacy_accepted as boolean,
    cancelledAt: row.cancelled_at as string | undefined,
    cancelledBy: row.cancelled_by as string | undefined,
    cancellationReason: row.cancellation_reason as string | undefined,
    cancellationFee: row.cancellation_fee as number,
    customerNotes: row.customer_notes as string | undefined,
    adminNotes: row.admin_notes as string | undefined,
    bookedVia: row.booked_via as string,
    ipAddress: row.ip_address as string | undefined,
    userAgent: row.user_agent as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    // Legacy aliases for backward compatibility
    planId: row.course_id as string,
    date: row.reservation_date as string,
    time: row.reservation_time as string,
    price: row.total_price as number,
    notes: row.customer_notes as string | undefined,
    bookedAt: row.created_at as string,
    stripePaymentId: row.stripe_payment_intent_id as string | undefined,
  };
}

function toPassenger(row: Record<string, unknown>): Passenger {
  return {
    id: row.id as string,
    reservationId: row.reservation_id as string,
    name: row.name as string,
    nameKana: row.name_kana as string | undefined,
    weightKg: row.weight_kg as number | undefined,
    isChild: row.is_child as boolean,
    isInfant: row.is_infant as boolean,
    seatNumber: row.seat_number as number | undefined,
    specialRequirements: row.special_requirements as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    reservationId: row.reservation_id as string,
    stripePaymentIntentId: row.stripe_payment_intent_id as string | undefined,
    stripeChargeId: row.stripe_charge_id as string | undefined,
    amount: row.amount as number,
    currency: row.currency as string,
    status: row.status as Payment['status'],
    paymentMethod: row.payment_method as string | undefined,
    cardLast4: row.card_last4 as string | undefined,
    cardBrand: row.card_brand as string | undefined,
    receiptUrl: row.receipt_url as string | undefined,
    paidAt: row.paid_at as string | undefined,
    failedAt: row.failed_at as string | undefined,
    failureReason: row.failure_reason as string | undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toCancellationPolicy(row: Record<string, unknown>): CancellationPolicy {
  return {
    id: row.id as string,
    name: row.name as string,
    daysBefore: row.days_before as number,
    feePercentage: row.fee_percentage as number,
    isActive: row.is_active as boolean,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toContactInquiry(row: Record<string, unknown>): ContactInquiry {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    subject: row.subject as string | undefined,
    message: row.message as string,
    lang: row.lang as SupportedLang,
    status: row.status as ContactInquiry['status'],
    assignedTo: row.assigned_to as string | undefined,
    resolvedAt: row.resolved_at as string | undefined,
    response: row.response as string | undefined,
    ipAddress: row.ip_address as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toAlphardTransfer(row: Record<string, unknown>): AlphardTransfer {
  return {
    id: row.id as string,
    reservationId: row.reservation_id as string | undefined,
    customerId: row.customer_id as string | undefined,
    pickupLocation: row.pickup_location as string,
    pickupDatetime: row.pickup_datetime as string,
    dropoffLocation: row.dropoff_location as string | undefined,
    passengers: row.passengers as number,
    status: row.status as AlphardTransfer['status'],
    notes: row.notes as string | undefined,
    approvedBy: row.approved_by as string | undefined,
    approvedAt: row.approved_at as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============================================================
// Heliport Operations
// ============================================================

export async function getHeliports(): Promise<Heliport[] | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('heliports')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching heliports:', error);
    return null;
  }

  return data.map(toHeliport);
}

export async function getHeliportById(id: string): Promise<Heliport | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('heliports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching heliport:', error);
    return null;
  }

  return toHeliport(data);
}

// ============================================================
// Course Operations
// ============================================================

export async function getCourses(): Promise<Course[] | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching courses:', error);
    return null;
  }

  return data.map(toCourse);
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*, heliports(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    return null;
  }

  const course = toCourse(data);
  if (data.heliports) {
    course.heliport = toHeliport(data.heliports as Record<string, unknown>);
  }

  return course;
}

// ============================================================
// Slot Operations
// ============================================================

export async function getAvailableSlots(courseId: string, date: string): Promise<Slot[] | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('course_id', courseId)
    .eq('slot_date', date)
    .eq('status', 'open')
    .order('slot_time');

  if (error) {
    console.error('Error fetching slots:', error);
    return null;
  }

  return data.map(toSlot).filter(slot => slot.availablePax! > 0);
}

export async function getSlotById(id: string): Promise<Slot | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('slots')
    .select('*, courses(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching slot:', error);
    return null;
  }

  const slot = toSlot(data);
  if (data.courses) {
    slot.course = toCourse(data.courses as Record<string, unknown>);
  }

  return slot;
}

export async function checkSlotAvailability(slotId: string, requiredPax: number): Promise<boolean> {
  if (!isConfigured()) return true;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('slots')
    .select('max_pax, current_pax, status')
    .eq('id', slotId)
    .single();

  if (error || !data) return false;

  return data.status === 'open' && (data.max_pax - data.current_pax) >= requiredPax;
}

// ============================================================
// Customer Operations
// ============================================================

export async function getOrCreateCustomer(
  email: string,
  name: string,
  options?: {
    nameKana?: string;
    phone?: string;
    preferredLang?: SupportedLang;
  }
): Promise<Customer | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();

  // Try to find existing customer
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) {
    return toCustomer(existing);
  }

  // Create new customer
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      email,
      name,
      name_kana: options?.nameKana,
      phone: options?.phone,
      preferred_lang: options?.preferredLang || 'ja',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return toCustomer(data);
}

export async function getCustomerByToken(token: string): Promise<Customer | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('mypage_token', token)
    .gt('mypage_token_expires_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('Error fetching customer by token:', error);
    return null;
  }

  return toCustomer(data);
}

// ============================================================
// Reservation Operations
// ============================================================

export async function createReservation(input: CreateReservationInput): Promise<Reservation | null> {
  if (!isConfigured()) {
    console.log('Mock creating reservation:', input);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return null;
  }

  const supabase = createClient();

  // Get or create customer
  const customer = await getOrCreateCustomer(
    input.customer.email,
    input.customer.name,
    {
      nameKana: input.customer.nameKana,
      phone: input.customer.phone,
      preferredLang: input.customer.preferredLang,
    }
  );

  if (!customer) {
    throw new Error('Failed to create or find customer');
  }

  // Get course for pricing
  const course = await getCourseById(input.courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // Calculate pricing
  const subtotal = course.price * input.passengers.length;
  const taxRate = 0.10; // 10% consumption tax
  const tax = Math.floor(subtotal * taxRate);
  const totalPrice = subtotal + tax;

  // Create reservation
  const { data: reservation, error: reservationError } = await supabase
    .from('reservations')
    .insert([{
      customer_id: customer.id,
      course_id: input.courseId,
      slot_id: input.slotId,
      reservation_date: input.reservationDate,
      reservation_time: input.reservationTime,
      pax: input.passengers.length,
      subtotal,
      tax,
      total_price: totalPrice,
      health_confirmed: input.healthConfirmed,
      terms_accepted: input.termsAccepted,
      privacy_accepted: input.privacyAccepted,
      customer_notes: input.customerNotes,
      booked_via: 'web',
    }])
    .select()
    .single();

  if (reservationError) {
    console.error('Error creating reservation:', reservationError);
    throw new Error('Failed to create reservation');
  }

  // Create passengers
  const passengersData = input.passengers.map((p, index) => ({
    reservation_id: reservation.id,
    name: p.name,
    name_kana: p.nameKana,
    weight_kg: p.weightKg,
    is_child: p.isChild || false,
    is_infant: p.isInfant || false,
    seat_number: index + 1,
  }));

  const { error: passengersError } = await supabase
    .from('passengers')
    .insert(passengersData);

  if (passengersError) {
    console.error('Error creating passengers:', passengersError);
    // Note: Reservation was created, but passengers failed
  }

  return toReservation(reservation);
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      customers(*),
      courses(*),
      slots(*),
      passengers(*),
      payments(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }

  const reservation = toReservation(data);

  if (data.customers) {
    reservation.customer = toCustomer(data.customers as Record<string, unknown>);
  }
  if (data.courses) {
    reservation.course = toCourse(data.courses as Record<string, unknown>);
  }
  if (data.slots) {
    reservation.slot = toSlot(data.slots as Record<string, unknown>);
  }
  if (data.passengers) {
    reservation.passengers = (data.passengers as Record<string, unknown>[]).map(toPassenger);
  }
  if (data.payments) {
    reservation.payments = (data.payments as Record<string, unknown>[]).map(toPayment);
  }

  return reservation;
}

export async function getReservationByBookingNumber(bookingNumber: string): Promise<Reservation | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      customers(*),
      courses(*),
      passengers(*)
    `)
    .eq('booking_number', bookingNumber)
    .single();

  if (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }

  const reservation = toReservation(data);

  if (data.customers) {
    reservation.customer = toCustomer(data.customers as Record<string, unknown>);
  }
  if (data.courses) {
    reservation.course = toCourse(data.courses as Record<string, unknown>);
  }
  if (data.passengers) {
    reservation.passengers = (data.passengers as Record<string, unknown>[]).map(toPassenger);
  }

  return reservation;
}

export async function getCustomerReservations(customerId: string): Promise<Reservation[] | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select('*, courses(*)')
    .eq('customer_id', customerId)
    .order('reservation_date', { ascending: false });

  if (error) {
    console.error('Error fetching customer reservations:', error);
    return null;
  }

  return data.map(row => {
    const reservation = toReservation(row);
    if (row.courses) {
      reservation.course = toCourse(row.courses as Record<string, unknown>);
    }
    return reservation;
  });
}

export async function updateReservationStatus(
  id: string,
  status: Reservation['status'],
  options?: {
    cancelledBy?: string;
    cancellationReason?: string;
    cancellationFee?: number;
  }
): Promise<boolean> {
  if (!isConfigured()) return false;

  const supabase = createClient();
  const updateData: Record<string, unknown> = { status };

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
    if (options?.cancelledBy) updateData.cancelled_by = options.cancelledBy;
    if (options?.cancellationReason) updateData.cancellation_reason = options.cancellationReason;
    if (options?.cancellationFee !== undefined) updateData.cancellation_fee = options.cancellationFee;
  }

  const { error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }

  return true;
}

// ============================================================
// Payment Operations
// ============================================================

export async function createPayment(
  reservationId: string,
  amount: number,
  stripePaymentIntentId: string
): Promise<Payment | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      reservation_id: reservationId,
      stripe_payment_intent_id: stripePaymentIntentId,
      amount,
      currency: 'jpy',
      status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    return null;
  }

  return toPayment(data);
}

export async function updatePaymentStatus(
  paymentIntentId: string,
  status: Payment['status'],
  options?: {
    chargeId?: string;
    cardLast4?: string;
    cardBrand?: string;
    receiptUrl?: string;
    failureReason?: string;
  }
): Promise<boolean> {
  if (!isConfigured()) return false;

  const supabase = createClient();
  const updateData: Record<string, unknown> = { status };

  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString();
  } else if (status === 'failed') {
    updateData.failed_at = new Date().toISOString();
    if (options?.failureReason) updateData.failure_reason = options.failureReason;
  }

  if (options?.chargeId) updateData.stripe_charge_id = options.chargeId;
  if (options?.cardLast4) updateData.card_last4 = options.cardLast4;
  if (options?.cardBrand) updateData.card_brand = options.cardBrand;
  if (options?.receiptUrl) updateData.receipt_url = options.receiptUrl;

  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    console.error('Error updating payment status:', error);
    return false;
  }

  return true;
}

// ============================================================
// Cancellation Policy Operations
// ============================================================

export async function getCancellationPolicies(): Promise<CancellationPolicy[] | null> {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('cancellation_policies')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching cancellation policies:', error);
    return null;
  }

  return data.map(toCancellationPolicy);
}

export async function calculateCancellationFee(reservationId: string): Promise<number> {
  if (!isConfigured()) return 0;

  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('calculate_cancellation_fee', { p_reservation_id: reservationId });

  if (error) {
    console.error('Error calculating cancellation fee:', error);
    return 0;
  }

  return data as number;
}

// ============================================================
// Contact Inquiry Operations
// ============================================================

export async function createContactInquiry(input: CreateContactInquiryInput): Promise<ContactInquiry | null> {
  if (!isConfigured()) {
    console.log('Mock creating contact inquiry:', input);
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('contact_inquiries')
    .insert([{
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: input.message,
      lang: input.lang || 'ja',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating contact inquiry:', error);
    return null;
  }

  return toContactInquiry(data);
}

// ============================================================
// Alphard Transfer Operations
// ============================================================

export async function createAlphardTransfer(
  input: CreateAlphardTransferInput,
  customerId?: string
): Promise<AlphardTransfer | null> {
  if (!isConfigured()) {
    console.log('Mock creating alphard transfer:', input);
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('alphard_transfers')
    .insert([{
      reservation_id: input.reservationId,
      customer_id: customerId,
      pickup_location: input.pickupLocation,
      pickup_datetime: input.pickupDatetime,
      dropoff_location: input.dropoffLocation,
      passengers: input.passengers || 1,
      notes: input.notes,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating alphard transfer:', error);
    return null;
  }

  return toAlphardTransfer(data);
}

// ============================================================
// Legacy exports for backward compatibility
// ============================================================

export interface DbPlan {
  id: string;
  title: string;
  duration: string;
  price: number;
  image_url: string;
  description: string;
  long_description: string;
  category: string;
  area: string;
  rating: number;
  popular: boolean;
  highlights: string[];
  itinerary: { time: string; activity: string }[];
}

export interface DbBooking {
  id?: string;
  plan_id: string;
  booking_date: string;
  time_slot: string;
  passengers: number;
  total_price: number;
  created_at?: string;
}

/** @deprecated Use getCourses instead */
export async function getPlans() {
  if (!isConfigured()) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return null;
  }
  return data as DbPlan[];
}

/** @deprecated Use createReservation instead */
export async function saveBooking(booking: DbBooking) {
  if (!isConfigured()) {
    console.log('Mock saving booking:', booking);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { ...booking, id: 'mock-id' };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();

  if (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
  return data[0];
}

/** @deprecated Use checkSlotAvailability instead */
export async function checkAvailability(date: string, timeSlot: string) {
  if (!isConfigured()) return true;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('time_slot', timeSlot);

  if (error) {
    console.error('Error checking availability:', error);
    return false;
  }

  return data.length === 0;
}

/** @deprecated Use getAvailableSlots instead */
export async function getBookedSlots(date: string) {
  if (!isConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('booking_date', date);

  if (error) {
    console.error('Error fetching booked slots:', error);
    return [];
  }

  return data.map((booking: { time_slot: string }) => booking.time_slot);
}
