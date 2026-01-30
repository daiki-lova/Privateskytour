// ============================================================
// Test Fixtures - Reusable test data constants
// ============================================================

import type { Course, Customer, Slot, Reservation } from '@/lib/data/types';

// ============================================================
// UUID Constants
// ============================================================

export const TEST_IDS = {
  COURSE_ID: '550e8400-e29b-41d4-a716-446655440001',
  SLOT_ID: '550e8400-e29b-41d4-a716-446655440002',
  RESERVATION_ID: '550e8400-e29b-41d4-a716-446655440003',
  CUSTOMER_ID: '550e8400-e29b-41d4-a716-446655440004',
  HELIPORT_ID: '550e8400-e29b-41d4-a716-446655440005',
  PAYMENT_ID: '550e8400-e29b-41d4-a716-446655440006',
  PASSENGER_ID: '550e8400-e29b-41d4-a716-446655440007',
  ADMIN_USER_ID: '550e8400-e29b-41d4-a716-446655440008',
} as const;

export const TEST_BOOKING_NUMBER = 'HF-20240615-0001';

// ============================================================
// Customer Fixture
// ============================================================

export const VALID_CUSTOMER: Customer = {
  id: TEST_IDS.CUSTOMER_ID,
  email: 'test@example.com',
  name: 'Test Customer',
  nameKana: 'テスト カスタマー',
  phone: '090-1234-5678',
  preferredLang: 'ja',
  totalSpent: 0,
  bookingCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ============================================================
// Course Fixture
// ============================================================

export const VALID_COURSE: Course = {
  id: TEST_IDS.COURSE_ID,
  title: 'Tokyo Bay Helicopter Tour',
  titleEn: 'Tokyo Bay Helicopter Tour',
  titleZh: '东京湾直升机之旅',
  description: '東京湾を一望できるヘリコプターツアー',
  courseType: 'standard',
  category: 'sightseeing',
  durationMinutes: 15,
  price: 50000,
  maxPax: 4,
  minPax: 1,
  isActive: true,
  displayOrder: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ============================================================
// Slot Fixture
// ============================================================

export const VALID_SLOT: Slot = {
  id: TEST_IDS.SLOT_ID,
  courseId: TEST_IDS.COURSE_ID,
  slotDate: '2024-06-15',
  slotTime: '10:00',
  date: '2024-06-15',
  time: '10:00',
  maxPax: 4,
  currentPax: 0,
  status: 'open',
  availablePax: 4,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ============================================================
// Reservation Fixture
// ============================================================

export const VALID_RESERVATION: Reservation = {
  id: TEST_IDS.RESERVATION_ID,
  bookingNumber: TEST_BOOKING_NUMBER,
  customerId: TEST_IDS.CUSTOMER_ID,
  courseId: TEST_IDS.COURSE_ID,
  slotId: TEST_IDS.SLOT_ID,
  reservationDate: '2024-06-15',
  reservationTime: '10:00',
  date: '2024-06-15',
  time: '10:00',
  pax: 2,
  subtotal: 100000,
  tax: 10000,
  totalPrice: 110000,
  price: 110000,
  status: 'pending',
  paymentStatus: 'pending',
  healthConfirmed: true,
  termsAccepted: true,
  privacyAccepted: true,
  bookedVia: 'web',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// ============================================================
// Reservation Input Data (for POST /api/public/reservations)
// ============================================================

export const VALID_RESERVATION_INPUT = {
  courseId: TEST_IDS.COURSE_ID,
  slotId: TEST_IDS.SLOT_ID,
  reservationDate: '2024-06-15',
  reservationTime: '10:00',
  customer: {
    email: 'test@example.com',
    name: 'Test Customer',
    phone: '090-1234-5678',
  },
  passengers: [{ name: 'Passenger 1' }, { name: 'Passenger 2' }],
  healthConfirmed: true,
  termsAccepted: true,
  privacyAccepted: true,
} as const;

// ============================================================
// Database row representations (snake_case for Supabase)
// ============================================================

export const DB_ROWS = {
  customer: {
    id: TEST_IDS.CUSTOMER_ID,
    email: 'test@example.com',
    name: 'Test Customer',
    name_kana: 'テスト カスタマー',
    phone: '090-1234-5678',
    preferred_lang: 'ja',
    total_spent: 0,
    booking_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  course: {
    id: TEST_IDS.COURSE_ID,
    title: 'Tokyo Bay Helicopter Tour',
    price: 50000,
    is_active: true,
    max_pax: 4,
    min_pax: 1,
    duration_minutes: 15,
    course_type: 'standard',
    display_order: 1,
  },
  slot: {
    id: TEST_IDS.SLOT_ID,
    course_id: TEST_IDS.COURSE_ID,
    slot_date: '2024-06-15',
    slot_time: '10:00',
    max_pax: 4,
    current_pax: 0,
    status: 'open',
  },
  reservation: {
    id: TEST_IDS.RESERVATION_ID,
    booking_number: TEST_BOOKING_NUMBER,
    customer_id: TEST_IDS.CUSTOMER_ID,
    course_id: TEST_IDS.COURSE_ID,
    slot_id: TEST_IDS.SLOT_ID,
    reservation_date: '2024-06-15',
    reservation_time: '10:00',
    pax: 2,
    subtotal: 100000,
    tax: 10000,
    total_price: 110000,
    status: 'pending',
    payment_status: 'pending',
    health_confirmed: true,
    terms_accepted: true,
    privacy_accepted: true,
    booked_via: 'web',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
} as const;
