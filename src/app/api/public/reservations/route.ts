import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type {
  Reservation,
  ReservationStatus,
  PaymentStatus,
  Customer,
  SupportedLang,
} from '@/lib/data/types';

/**
 * Convert database row to Customer type
 */
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
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Convert database row to Reservation type
 */
function toReservation(row: Record<string, unknown>): Reservation {
  const reservationDate = row.reservation_date as string;
  const reservationTime = row.reservation_time as string;
  const totalPrice = row.total_price as number;

  return {
    id: row.id as string,
    bookingNumber: row.booking_number as string,
    customerId: row.customer_id as string,
    courseId: row.course_id as string,
    slotId: row.slot_id as string,
    reservationDate,
    reservationTime,
    pax: row.pax as number,
    subtotal: row.subtotal as number,
    tax: row.tax as number,
    totalPrice,
    status: row.status as ReservationStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    stripePaymentIntentId: row.stripe_payment_intent_id as string | undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id as string | undefined,
    healthConfirmed: row.health_confirmed as boolean,
    termsAccepted: row.terms_accepted as boolean,
    privacyAccepted: row.privacy_accepted as boolean,
    customerNotes: row.customer_notes as string | undefined,
    bookedVia: row.booked_via as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    // Legacy aliases
    date: reservationDate,
    time: reservationTime,
    price: totalPrice,
    notes: row.customer_notes as string | undefined,
    bookedAt: row.created_at as string,
  };
}

/**
 * Validate the reservation request body
 */
function validateReservationInput(body: Record<string, unknown>): string | null {
  // Required fields
  if (!body.courseId || typeof body.courseId !== 'string') {
    return 'courseId is required';
  }
  if (!body.slotId || typeof body.slotId !== 'string') {
    return 'slotId is required';
  }
  if (!body.reservationDate || typeof body.reservationDate !== 'string') {
    return 'reservationDate is required';
  }
  if (!body.reservationTime || typeof body.reservationTime !== 'string') {
    return 'reservationTime is required';
  }

  // Customer validation
  const customer = body.customer as Record<string, unknown> | undefined;
  if (!customer || typeof customer !== 'object') {
    return 'customer information is required';
  }
  if (!customer.email || typeof customer.email !== 'string') {
    return 'customer.email is required';
  }
  if (!customer.name || typeof customer.name !== 'string') {
    return 'customer.name is required';
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer.email as string)) {
    return 'Invalid email format';
  }

  // Passengers validation
  const passengers = body.passengers as unknown[] | undefined;
  if (!Array.isArray(passengers) || passengers.length === 0) {
    return 'At least one passenger is required';
  }

  for (let i = 0; i < passengers.length; i++) {
    const p = passengers[i] as Record<string, unknown>;
    if (!p.name || typeof p.name !== 'string') {
      return `passengers[${i}].name is required`;
    }
  }

  // Consent validation
  if (body.healthConfirmed !== true) {
    return 'Health confirmation is required';
  }
  if (body.termsAccepted !== true) {
    return 'Terms acceptance is required';
  }
  if (body.privacyAccepted !== true) {
    return 'Privacy acceptance is required';
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(body.courseId as string)) {
    return 'Invalid courseId format';
  }
  if (!uuidRegex.test(body.slotId as string)) {
    return 'Invalid slotId format';
  }

  // Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.reservationDate as string)) {
    return 'Invalid reservationDate format. Use YYYY-MM-DD';
  }

  // Time format validation
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(body.reservationTime as string)) {
    return 'Invalid reservationTime format. Use HH:mm';
  }

  return null;
}

/**
 * POST /api/public/reservations
 * Create a new public reservation
 */
export async function POST(request: NextRequest) {
  try {
    // Use regular client - RLS policies allow public inserts
    const supabase = await createClient();

    const body = await request.json();

    // Validate input
    const validationError = validateReservationInput(body);
    if (validationError) {
      return errorResponse(validationError, HttpStatus.BAD_REQUEST);
    }

    const customer = body.customer as Record<string, unknown>;
    const passengers = body.passengers as Record<string, unknown>[];

    // 1. Check slot availability
    const { data: slotData, error: slotError } = await supabase
      .from('slots')
      .select('id, max_pax, current_pax, status')
      .eq('id', body.slotId)
      .single();

    if (slotError || !slotData) {
      console.error('Slot not found:', slotError);
      return errorResponse('Slot not found', HttpStatus.NOT_FOUND);
    }

    if (slotData.status !== 'open') {
      return errorResponse('Slot is not available', HttpStatus.CONFLICT);
    }

    const availablePax = slotData.max_pax - slotData.current_pax;
    if (availablePax < passengers.length) {
      return errorResponse(
        `Not enough availability. Only ${availablePax} spots available.`,
        HttpStatus.CONFLICT
      );
    }

    // 2. Get course for pricing
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, price, is_active')
      .eq('id', body.courseId)
      .single();

    if (courseError || !courseData) {
      return errorResponse('Course not found', HttpStatus.NOT_FOUND);
    }

    if (!courseData.is_active) {
      return errorResponse('Course is not available', HttpStatus.CONFLICT);
    }

    // 3. Get or create customer
    let customerRecord: Customer;

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customer.email)
      .single();

    if (existingCustomer) {
      customerRecord = toCustomer(existingCustomer);
    } else {
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from('customers')
        .insert([
          {
            email: customer.email,
            name: customer.name,
            name_kana: customer.nameKana,
            phone: customer.phone,
            preferred_lang: customer.preferredLang || 'ja',
          },
        ])
        .select()
        .single();

      if (customerCreateError || !newCustomer) {
        console.error('Error creating customer:', customerCreateError);
        return errorResponse('Failed to create customer', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      customerRecord = toCustomer(newCustomer);
    }

    // 4. Calculate pricing
    const subtotal = courseData.price * passengers.length;
    const taxRate = 0.1; // 10% consumption tax
    const tax = Math.floor(subtotal * taxRate);
    const totalPrice = subtotal + tax;

    // 5. Get client IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 6. Create reservation
    const { data: reservationData, error: reservationError } = await supabase
      .from('reservations')
      .insert([
        {
          customer_id: customerRecord.id,
          course_id: body.courseId,
          slot_id: body.slotId,
          reservation_date: body.reservationDate,
          reservation_time: body.reservationTime,
          pax: passengers.length,
          subtotal,
          tax,
          total_price: totalPrice,
          health_confirmed: true,
          terms_accepted: true,
          privacy_accepted: true,
          customer_notes: body.customerNotes || null,
          booked_via: 'web',
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ])
      .select()
      .single();

    if (reservationError || !reservationData) {
      console.error('Error creating reservation:', reservationError);
      return errorResponse('Failed to create reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 7. Create passengers
    const passengersData = passengers.map((p, index) => ({
      reservation_id: reservationData.id,
      name: p.name,
      name_kana: p.nameKana || null,
      name_romaji: p.nameRomaji || null,
      weight_kg: p.weightKg || null,
      is_child: p.isChild || false,
      is_infant: p.isInfant || false,
      seat_number: index + 1,
    }));

    const { error: passengersError } = await supabase
      .from('passengers')
      .insert(passengersData);

    if (passengersError) {
      console.error('Error creating passengers:', passengersError);
      // Reservation was created, passengers failed - log but don't fail the request
    }

    // 8. Update slot current_pax
    const { error: slotUpdateError } = await supabase
      .from('slots')
      .update({ current_pax: slotData.current_pax + passengers.length })
      .eq('id', body.slotId);

    if (slotUpdateError) {
      console.error('Error updating slot:', slotUpdateError);
      // Log but don't fail the request
    }

    const reservation = toReservation(reservationData);
    reservation.customer = customerRecord;

    return successResponse(reservation, HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', HttpStatus.BAD_REQUEST);
    }
    console.error('Create reservation error:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
