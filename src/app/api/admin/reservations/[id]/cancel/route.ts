import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import { sendAdminCancellationNotice } from '@/lib/email/client';
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/reservations/[id]/cancel
 * Cancel a reservation with reason
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const adminUser = await requireRole(supabase, ['admin', 'staff']);

    const { id } = await context.params;

    if (!id) {
      return errorResponse('Reservation ID is required', HttpStatus.BAD_REQUEST);
    }

    const body = await request.json();

    // Validate cancellation reason
    if (!body.reason || typeof body.reason !== 'string' || body.reason.trim() === '') {
      return errorResponse('Cancellation reason is required', HttpStatus.BAD_REQUEST);
    }

    // First, check if the reservation exists and can be cancelled
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, booking_number, status, slot_id, pax, total_price, reservation_date')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching reservation:', fetchError);
      return errorResponse('Failed to fetch reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Check if already cancelled
    if (existingReservation.status === 'cancelled') {
      return errorResponse('Reservation is already cancelled', HttpStatus.BAD_REQUEST);
    }

    // Check if completed
    if (existingReservation.status === 'completed') {
      return errorResponse('Cannot cancel a completed reservation', HttpStatus.BAD_REQUEST);
    }

    // Calculate cancellation fee (if applicable)
    let cancellationFee = 0;

    if (body.cancellationFee !== undefined) {
      // Use provided cancellation fee
      cancellationFee = body.cancellationFee;
    } else {
      // Try to calculate using database function
      try {
        const { data: calculatedFee, error: feeError } = await supabase.rpc(
          'calculate_cancellation_fee',
          {
            p_reservation_id: id,
          }
        );

        if (!feeError && calculatedFee !== null) {
          cancellationFee = calculatedFee;
        }
      } catch {
        // If calculation fails, default to 0
        // Cancellation fee calculation not available, using 0
      }
    }

    // Update the reservation to cancelled status
    const { data, error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: adminUser.id,
        cancellation_reason: body.reason.trim(),
        cancellation_fee: cancellationFee,
      })
      .eq('id', id)
      .select('*, customers(*), courses(*)')
      .single();

    if (updateError) {
      console.error('Error cancelling reservation:', updateError);
      return errorResponse('Failed to cancel reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Update slot current_pax if there was a slot
    if (existingReservation.slot_id) {
      await supabase.rpc('decrement_slot_pax', {
        p_slot_id: existingReservation.slot_id,
        p_pax: existingReservation.pax,
      });
    }

    // Transform response
    const reservation = toReservation(data as Record<string, unknown>);

    if (data.customers) {
      reservation.customer = toCustomer(data.customers as Record<string, unknown>);
      reservation.customerName = reservation.customer.name;
      reservation.customerEmail = reservation.customer.email;
      reservation.customerPhone = reservation.customer.phone;
      reservation.customerLang = reservation.customer.preferredLang;
    }
    if (data.courses) {
      reservation.course = toCourse(data.courses as Record<string, unknown>);
      reservation.planName = reservation.course.title;
    }

    // Send cancellation notice email to customer (fire-and-forget)
    if (reservation.customer?.email) {
      try {
        sendAdminCancellationNotice({
          to: reservation.customer.email,
          customerName: reservation.customer.name,
          courseName: reservation.course?.title || '',
          flightDate: reservation.reservationDate || '',
          flightTime: reservation.reservationTime || '',
          bookingNumber: reservation.bookingNumber,
          reason: body.reason?.trim(),
          refundAmount: cancellationFee > 0 && reservation.totalPrice ? reservation.totalPrice - cancellationFee : undefined,
        }).catch((emailError) => {
          console.error('[Email] Failed to send admin cancellation notice:', emailError);
        });
      } catch (emailError) {
        console.error('[Email] Failed to send admin cancellation notice:', emailError);
      }
    }

    return successResponse({
      reservation,
      cancellationDetails: {
        cancelledAt: reservation.cancelledAt,
        cancelledBy: adminUser.email,
        reason: body.reason.trim(),
        cancellationFee,
      },
    });
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

    console.error('Unexpected error in POST /api/admin/reservations/[id]/cancel:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
