import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import type {
  Reservation,
  ReservationStatus,
  Customer,
  Course,
  Slot,
  Passenger,
  Payment,
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
    // Legacy aliases
    date: row.slot_date as string,
    time: row.slot_time as string,
    reason: row.suspended_reason as string | undefined,
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/reservations/[id]
 * Get a single reservation by ID
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff']);

    const { id } = await context.params;

    if (!id) {
      return errorResponse('Reservation ID is required', HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('reservations')
      .select(
        `
        *,
        customers(*),
        courses(*),
        slots(*),
        passengers(*),
        payments(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching reservation:', error);
      return errorResponse('Failed to fetch reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform the data
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
    if (data.slots) {
      reservation.slot = toSlot(data.slots as Record<string, unknown>);
    }
    if (data.passengers) {
      reservation.passengers = (data.passengers as Record<string, unknown>[]).map(toPassenger);
      const totalWeight = reservation.passengers.reduce((sum, p) => sum + (p.weightKg || 0), 0);
      if (totalWeight > 0) {
        reservation.weight = totalWeight;
      }
    }
    if (data.payments) {
      reservation.payments = (data.payments as Record<string, unknown>[]).map(toPayment);
    }

    return successResponse(reservation);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in GET /api/admin/reservations/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PATCH /api/admin/reservations/[id]
 * Update a reservation
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const adminUser = await requireRole(supabase, ['admin', 'staff']);

    const { id } = await context.params;

    if (!id) {
      return errorResponse('Reservation ID is required', HttpStatus.BAD_REQUEST);
    }

    const body = await request.json();

    // Build update object
    const updateData: Record<string, unknown> = {};

    // Allowed fields for update
    if (body.pax !== undefined) updateData.pax = body.pax;
    if (body.customerNotes !== undefined) updateData.customer_notes = body.customerNotes;
    if (body.adminNotes !== undefined) updateData.admin_notes = body.adminNotes;
    if (body.healthConfirmed !== undefined) updateData.health_confirmed = body.healthConfirmed;
    if (body.reservationDate !== undefined) updateData.reservation_date = body.reservationDate;
    if (body.reservationTime !== undefined) updateData.reservation_time = body.reservationTime;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.payment_status = body.paymentStatus;
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
    if (body.tax !== undefined) updateData.tax = body.tax;
    if (body.totalPrice !== undefined) updateData.total_price = body.totalPrice;
    if (body.courseId !== undefined) updateData.course_id = body.courseId;
    if (body.slotId !== undefined) updateData.slot_id = body.slotId;

    // Handle status change to cancelled
    if (body.status === 'cancelled' && body.cancellationReason) {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancelled_by = adminUser.id;
      updateData.cancellation_reason = body.cancellationReason;
      if (body.cancellationFee !== undefined) {
        updateData.cancellation_fee = body.cancellationFee;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select('*, customers(*), courses(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error updating reservation:', error);
      return errorResponse('Failed to update reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Transform response
    const reservation = toReservation(data as Record<string, unknown>);

    if (data.customers) {
      reservation.customer = toCustomer(data.customers as Record<string, unknown>);
      reservation.customerName = reservation.customer.name;
      reservation.customerEmail = reservation.customer.email;
    }
    if (data.courses) {
      reservation.course = toCourse(data.courses as Record<string, unknown>);
      reservation.planName = reservation.course.title;
    }

    return successResponse(reservation);
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

    console.error('Unexpected error in PATCH /api/admin/reservations/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/admin/reservations/[id]
 * Delete a reservation
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const adminUser = await requireRole(supabase, ['admin', 'staff']);

    const { id } = await context.params;

    if (!id) {
      return errorResponse('Reservation ID is required', HttpStatus.BAD_REQUEST);
    }

    // First, get the reservation to check it exists and get related data
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, booking_number, slot_id, pax, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching reservation:', fetchError);
      return errorResponse('Failed to fetch reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Check if reservation can be deleted (e.g., not already completed)
    if (existingReservation.status === 'completed') {
      return errorResponse('Cannot delete a completed reservation', HttpStatus.BAD_REQUEST);
    }

    // Delete related passengers first (due to foreign key constraint)
    const { error: passengersError } = await supabase
      .from('passengers')
      .delete()
      .eq('reservation_id', id);

    if (passengersError) {
      console.error('Error deleting passengers:', passengersError);
      return errorResponse('Failed to delete related passengers', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Delete the reservation
    const { error: deleteError } = await supabase.from('reservations').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting reservation:', deleteError);
      return errorResponse('Failed to delete reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Update slot current_pax if there was a slot
    if (existingReservation.slot_id) {
      await supabase.rpc('decrement_slot_pax', {
        p_slot_id: existingReservation.slot_id,
        p_pax: existingReservation.pax,
      });
    }

    return successResponse({ message: 'Reservation deleted successfully' });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in DELETE /api/admin/reservations/[id]:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
