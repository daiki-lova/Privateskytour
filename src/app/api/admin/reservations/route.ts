import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '@/lib/api/response';
import type {
  Reservation,
  ReservationStatus,
  Customer,
  Course,
  SupportedLang,
} from '@/lib/data/types';

// Type converters for database rows
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
    status: row.status as ReservationStatus,
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
    // Legacy aliases
    planId: row.course_id as string,
    date: row.reservation_date as string,
    time: row.reservation_time as string,
    price: row.total_price as number,
    notes: row.customer_notes as string | undefined,
    bookedAt: row.created_at as string,
    stripePaymentId: row.stripe_payment_intent_id as string | undefined,
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

/**
 * GET /api/admin/reservations
 * List reservations with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff']);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const status = searchParams.get('status') as ReservationStatus | null;
    const date = searchParams.get('date');
    const customerId = searchParams.get('customerId');

    // Build the query
    let query = supabase
      .from('reservations')
      .select('*, customers(*), courses(*)', { count: 'exact' })
      .order('reservation_date', { ascending: false })
      .order('reservation_time', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (date) {
      query = query.eq('reservation_date', date);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching reservations:', error);
      return errorResponse('Failed to fetch reservations', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform the data
    const reservations = (data ?? []).map((row) => {
      const reservation = toReservation(row as Record<string, unknown>);

      if (row.customers) {
        reservation.customer = toCustomer(row.customers as Record<string, unknown>);
        reservation.customerName = reservation.customer.name;
        reservation.customerEmail = reservation.customer.email;
        reservation.customerPhone = reservation.customer.phone;
        reservation.customerLang = reservation.customer.preferredLang;
      }
      if (row.courses) {
        reservation.course = toCourse(row.courses as Record<string, unknown>);
        reservation.planName = reservation.course.title;
      }

      return reservation;
    });

    return paginatedResponse(reservations, count ?? 0, page, pageSize);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in GET /api/admin/reservations:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/admin/reservations
 * Create a new reservation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminUser = await requireRole(supabase, ['admin', 'staff']);

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['courseId', 'reservationDate', 'reservationTime', 'customer', 'pax'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`Missing required field: ${field}`, HttpStatus.BAD_REQUEST);
      }
    }

    // Validate customer fields
    if (!body.customer.email || !body.customer.name) {
      return errorResponse('Customer email and name are required', HttpStatus.BAD_REQUEST);
    }

    // Get or create customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', body.customer.email)
      .single();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            email: body.customer.email,
            name: body.customer.name,
            name_kana: body.customer.nameKana,
            phone: body.customer.phone,
            preferred_lang: body.customer.preferredLang || 'ja',
          },
        ])
        .select()
        .single();

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError);
        return errorResponse('Failed to create customer', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      customerId = newCustomer.id;
    }

    // Get course for pricing
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('price')
      .eq('id', body.courseId)
      .single();

    if (courseError || !course) {
      return errorResponse('Course not found', HttpStatus.NOT_FOUND);
    }

    // Calculate pricing
    const pax = body.pax as number;
    const subtotal = course.price * pax;
    const taxRate = 0.1; // 10% consumption tax
    const tax = Math.floor(subtotal * taxRate);
    const totalPrice = subtotal + tax;

    // Create reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert([
        {
          customer_id: customerId,
          course_id: body.courseId,
          slot_id: body.slotId,
          reservation_date: body.reservationDate,
          reservation_time: body.reservationTime,
          pax,
          subtotal,
          tax,
          total_price: totalPrice,
          status: body.status || 'pending',
          payment_status: body.paymentStatus || 'unpaid',
          health_confirmed: body.healthConfirmed || false,
          terms_accepted: body.termsAccepted || false,
          privacy_accepted: body.privacyAccepted || false,
          customer_notes: body.customerNotes,
          admin_notes: body.adminNotes,
          booked_via: 'admin',
        },
      ])
      .select('*, customers(*), courses(*)')
      .single();

    if (reservationError || !reservation) {
      console.error('Error creating reservation:', reservationError);
      return errorResponse('Failed to create reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Create passengers if provided
    if (body.passengers && Array.isArray(body.passengers) && body.passengers.length > 0) {
      const passengersData = body.passengers.map(
        (p: { name: string; nameKana?: string; weightKg?: number; isChild?: boolean; isInfant?: boolean }, index: number) => ({
          reservation_id: reservation.id,
          name: p.name,
          name_kana: p.nameKana,
          weight_kg: p.weightKg,
          is_child: p.isChild || false,
          is_infant: p.isInfant || false,
          seat_number: index + 1,
        })
      );

      const { error: passengersError } = await supabase.from('passengers').insert(passengersData);

      if (passengersError) {
        console.error('Error creating passengers:', passengersError);
        // Note: Reservation was created, but passengers failed - we continue anyway
      }
    }

    // Update slot current_pax if slotId provided
    if (body.slotId) {
      await supabase.rpc('increment_slot_pax', {
        p_slot_id: body.slotId,
        p_pax: pax,
      });
    }

    // Transform response
    const transformedReservation = toReservation(reservation as Record<string, unknown>);

    if (reservation.customers) {
      transformedReservation.customer = toCustomer(reservation.customers as Record<string, unknown>);
      transformedReservation.customerName = transformedReservation.customer.name;
      transformedReservation.customerEmail = transformedReservation.customer.email;
    }
    if (reservation.courses) {
      transformedReservation.course = toCourse(reservation.courses as Record<string, unknown>);
      transformedReservation.planName = transformedReservation.course.title;
    }

    return successResponse(transformedReservation, HttpStatus.CREATED);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', HttpStatus.BAD_REQUEST);
    }

    console.error('Unexpected error in POST /api/admin/reservations:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
