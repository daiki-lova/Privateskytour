import { randomBytes } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

/**
 * Token configuration
 */
const TOKEN_CONFIG = {
  /** Token length in bytes (64 bytes = 128 hex characters) */
  TOKEN_BYTES: 64,
  /** Default token expiration in days */
  DEFAULT_EXPIRATION_DAYS: 90,
} as const;

/**
 * Result of mypage token validation
 */
export interface MypageTokenValidationResult {
  valid: boolean;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Customer data returned when token is valid
 */
export interface MypageCustomerData {
  id: string;
  email: string;
  name: string;
  nameKana: string | null;
  phone: string | null;
  preferredLang: Database['public']['Enums']['supported_lang'] | null;
  bookingCount: number | null;
  totalSpent: number | null;
  firstBookingDate: string | null;
  lastBookingDate: string | null;
}

/**
 * Reservation data for mypage display
 */
export interface MypageReservationData {
  id: string;
  bookingNumber: string;
  reservationDate: string;
  reservationTime: string;
  pax: number;
  status: Database['public']['Enums']['reservation_status'] | null;
  paymentStatus: Database['public']['Enums']['payment_status'] | null;
  totalPrice: number;
  course: {
    id: string;
    title: string;
    titleEn: string | null;
    durationMinutes: number;
  } | null;
  heliport: {
    id: string;
    name: string;
    nameEn: string | null;
    address: string;
  } | null;
  createdAt: string;
}

/**
 * Full mypage data including customer and reservations
 */
export interface MypageData {
  customer: MypageCustomerData;
  reservations: MypageReservationData[];
}

/**
 * Generate a secure random token for mypage access
 *
 * Uses crypto.randomBytes for cryptographically secure random generation.
 * Token is 128 hex characters (64 bytes) for sufficient entropy.
 *
 * @returns A secure random hex string token
 */
export function generateMypageToken(): string {
  return randomBytes(TOKEN_CONFIG.TOKEN_BYTES).toString('hex');
}

/**
 * Calculate token expiration date
 *
 * @param days - Number of days until expiration (default: 90)
 * @returns ISO string of expiration date
 */
export function calculateTokenExpiration(
  days: number = TOKEN_CONFIG.DEFAULT_EXPIRATION_DAYS
): string {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate.toISOString();
}

/**
 * Validate mypage token format
 *
 * Checks if token is a valid hex string of expected length.
 *
 * @param token - Token string to validate
 * @returns true if format is valid, false otherwise
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Token should be hex characters only
  const hexRegex = /^[a-f0-9]+$/i;
  if (!hexRegex.test(token)) {
    return false;
  }

  // Token should be at least 64 characters (32 bytes minimum)
  // Our tokens are 128 characters (64 bytes)
  return token.length >= 64;
}

/**
 * Validate a mypage token against the database
 *
 * Checks:
 * 1. Token format is valid
 * 2. Token exists in customers table
 * 3. Token has not expired
 *
 * @param supabase - Supabase client instance
 * @param token - Token to validate
 * @returns Validation result with customer info if valid
 */
export async function validateMypageToken(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<MypageTokenValidationResult> {
  // Validate token format first (prevents unnecessary DB queries)
  if (!isValidTokenFormat(token)) {
    return {
      valid: false,
      error: 'Invalid token format',
    };
  }

  // Query customer by token
  const { data: customer, error } = await supabase
    .from('customers')
    .select('id, email, name, mypage_token_expires_at')
    .eq('mypage_token', token)
    .single();

  if (error || !customer) {
    return {
      valid: false,
      error: 'Token not found',
    };
  }

  // Check token expiration
  if (customer.mypage_token_expires_at) {
    const expiresAt = new Date(customer.mypage_token_expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return {
        valid: false,
        error: 'Token has expired',
        expiresAt: customer.mypage_token_expires_at,
      };
    }
  }

  return {
    valid: true,
    customerId: customer.id,
    customerEmail: customer.email,
    customerName: customer.name,
    expiresAt: customer.mypage_token_expires_at ?? undefined,
  };
}

/**
 * Get full mypage data for a validated token
 *
 * @param supabase - Supabase client instance
 * @param token - Validated mypage token
 * @returns Customer data and their reservations
 */
export async function getMypageData(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<MypageData | null> {
  // First validate the token
  const validation = await validateMypageToken(supabase, token);

  if (!validation.valid || !validation.customerId) {
    return null;
  }

  // Get full customer data
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select(`
      id,
      email,
      name,
      name_kana,
      phone,
      preferred_lang,
      booking_count,
      total_spent,
      first_booking_date,
      last_booking_date
    `)
    .eq('id', validation.customerId)
    .single();

  if (customerError || !customer) {
    return null;
  }

  // Get customer's reservations with course and heliport info
  const { data: reservations, error: reservationsError } = await supabase
    .from('reservations')
    .select(`
      id,
      booking_number,
      reservation_date,
      reservation_time,
      pax,
      status,
      payment_status,
      total_price,
      created_at,
      courses (
        id,
        title,
        title_en,
        duration_minutes,
        heliports (
          id,
          name,
          name_en,
          address
        )
      )
    `)
    .eq('customer_id', validation.customerId)
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false });

  if (reservationsError) {
    console.error('Error fetching reservations:', reservationsError);
    // Return customer data even if reservations fail
    return {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        nameKana: customer.name_kana,
        phone: customer.phone,
        preferredLang: customer.preferred_lang,
        bookingCount: customer.booking_count,
        totalSpent: customer.total_spent,
        firstBookingDate: customer.first_booking_date,
        lastBookingDate: customer.last_booking_date,
      },
      reservations: [],
    };
  }

  // Map reservations to response format
  const mappedReservations: MypageReservationData[] = (reservations ?? []).map(
    (reservation) => {
      // Type assertion for nested course data
      const course = reservation.courses as {
        id: string;
        title: string;
        title_en: string | null;
        duration_minutes: number;
        heliports: {
          id: string;
          name: string;
          name_en: string | null;
          address: string;
        } | null;
      } | null;

      return {
        id: reservation.id,
        bookingNumber: reservation.booking_number,
        reservationDate: reservation.reservation_date,
        reservationTime: reservation.reservation_time,
        pax: reservation.pax,
        status: reservation.status,
        paymentStatus: reservation.payment_status,
        totalPrice: reservation.total_price,
        course: course
          ? {
              id: course.id,
              title: course.title,
              titleEn: course.title_en,
              durationMinutes: course.duration_minutes,
            }
          : null,
        heliport: course?.heliports
          ? {
              id: course.heliports.id,
              name: course.heliports.name,
              nameEn: course.heliports.name_en,
              address: course.heliports.address,
            }
          : null,
        createdAt: reservation.created_at ?? new Date().toISOString(),
      };
    }
  );

  return {
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      nameKana: customer.name_kana,
      phone: customer.phone,
      preferredLang: customer.preferred_lang,
      bookingCount: customer.booking_count,
      totalSpent: customer.total_spent,
      firstBookingDate: customer.first_booking_date,
      lastBookingDate: customer.last_booking_date,
    },
    reservations: mappedReservations,
  };
}

/**
 * Create or refresh a mypage token for a customer
 *
 * Updates the customer's mypage_token and mypage_token_expires_at fields.
 *
 * @param supabase - Supabase client instance
 * @param customerId - Customer ID to update
 * @param expirationDays - Days until token expires (default: 90)
 * @returns The new token or null if update failed
 */
export async function createOrRefreshMypageToken(
  supabase: SupabaseClient<Database>,
  customerId: string,
  expirationDays: number = TOKEN_CONFIG.DEFAULT_EXPIRATION_DAYS
): Promise<string | null> {
  const newToken = generateMypageToken();
  const expiresAt = calculateTokenExpiration(expirationDays);

  const { error } = await supabase
    .from('customers')
    .update({
      mypage_token: newToken,
      mypage_token_expires_at: expiresAt,
    })
    .eq('id', customerId);

  if (error) {
    console.error('Error creating mypage token:', error);
    return null;
  }

  return newToken;
}

/**
 * Revoke a customer's mypage token
 *
 * Clears the mypage_token and mypage_token_expires_at fields.
 *
 * @param supabase - Supabase client instance
 * @param customerId - Customer ID to revoke token for
 * @returns true if successful, false otherwise
 */
export async function revokeMypageToken(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('customers')
    .update({
      mypage_token: null,
      mypage_token_expires_at: null,
    })
    .eq('id', customerId);

  if (error) {
    console.error('Error revoking mypage token:', error);
    return false;
  }

  return true;
}

/**
 * Build a mypage URL with token
 *
 * @param baseUrl - Base URL of the application
 * @param token - Mypage token
 * @returns Full mypage URL with token parameter
 */
export function buildMypageUrl(baseUrl: string, token: string): string {
  const url = new URL('/mypage', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}
