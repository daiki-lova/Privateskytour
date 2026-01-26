import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import {
  calculateCancellationFee,
  getCancellationPolicyTiers,
  type CancellationFeeResult,
} from '@/lib/cancellation/policy';
import {
  validateMypageToken,
  type MypageTokenValidationResult,
} from '@/lib/auth/mypage-token';
import type { Database } from '@/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type for reservation with customer join
 */
interface ReservationWithCustomer {
  id: string;
  booking_number: string;
  customer_id: string;
  reservation_date: string;
  reservation_time: string;
  total_price: number;
  status: Database['public']['Enums']['reservation_status'] | null;
  payment_status: Database['public']['Enums']['payment_status'] | null;
  customers: {
    id: string;
    email: string;
    name: string;
    mypage_token: string | null;
  } | null;
}

/**
 * GET /api/public/reservations/[id]/cancel
 *
 * Get cancellation fee information for a reservation
 *
 * Query Parameters:
 * - token: Mypage token for authentication (required)
 *
 * Response:
 * - 200: { cancellation: CancellationFeeResult, policy: CancellationTier[] }
 * - 401: Invalid or missing token
 * - 403: Reservation does not belong to authenticated customer
 * - 404: Reservation not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate token
    if (!token) {
      return errorResponse('Token is required', HttpStatus.UNAUTHORIZED);
    }

    const supabase = (await createClient()) as SupabaseClient<Database>;

    // Validate mypage token
    const tokenValidation: MypageTokenValidationResult = await validateMypageToken(
      supabase,
      token
    );

    if (!tokenValidation.valid || !tokenValidation.customerId) {
      return errorResponse(
        tokenValidation.error ?? 'Invalid token',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Get reservation with customer
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(
        `
        id,
        booking_number,
        customer_id,
        reservation_date,
        reservation_time,
        total_price,
        status,
        payment_status,
        customers (
          id,
          email,
          name,
          mypage_token
        )
      `
      )
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
    }

    // Type assertion for the joined data
    const typedReservation = reservation as unknown as ReservationWithCustomer;

    // Verify reservation belongs to authenticated customer
    if (typedReservation.customer_id !== tokenValidation.customerId) {
      return errorResponse(
        'This reservation does not belong to your account',
        HttpStatus.FORBIDDEN
      );
    }

    // Calculate cancellation fee
    const cancellationResult: CancellationFeeResult = calculateCancellationFee(
      typedReservation.total_price,
      typedReservation.reservation_date,
      typedReservation.status ?? 'pending'
    );

    // Get policy tiers for display
    const policyTiers = getCancellationPolicyTiers();

    return successResponse({
      reservationId: typedReservation.id,
      bookingNumber: typedReservation.booking_number,
      reservationDate: typedReservation.reservation_date,
      reservationTime: typedReservation.reservation_time,
      cancellation: cancellationResult,
      policy: policyTiers,
    });
  } catch (error) {
    console.error('Get cancellation info error:', error);
    return errorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/public/reservations/[id]/cancel
 *
 * Cancel a reservation
 *
 * Request Body:
 * - token: Mypage token for authentication (required)
 * - reason: Cancellation reason (optional)
 *
 * Response:
 * - 200: { success: true, reservation: {...}, cancellation: {...} }
 * - 400: Cannot cancel reservation (already cancelled, etc.)
 * - 401: Invalid or missing token
 * - 403: Reservation does not belong to authenticated customer
 * - 404: Reservation not found
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const body = await request.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const reason = body.reason as string | undefined;

    // Validate token
    if (!token) {
      return errorResponse('Token is required', HttpStatus.UNAUTHORIZED);
    }

    const supabase = (await createClient()) as SupabaseClient<Database>;

    // Validate mypage token
    const tokenValidation: MypageTokenValidationResult = await validateMypageToken(
      supabase,
      token
    );

    if (!tokenValidation.valid || !tokenValidation.customerId) {
      return errorResponse(
        tokenValidation.error ?? 'Invalid token',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Get reservation with customer
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select(
        `
        id,
        booking_number,
        customer_id,
        reservation_date,
        reservation_time,
        total_price,
        status,
        payment_status,
        slot_id,
        pax,
        customers (
          id,
          email,
          name,
          mypage_token
        )
      `
      )
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
    }

    // Type assertion
    const typedReservation = reservation as unknown as ReservationWithCustomer & {
      slot_id: string;
      pax: number;
    };

    // Verify reservation belongs to authenticated customer
    if (typedReservation.customer_id !== tokenValidation.customerId) {
      return errorResponse(
        'This reservation does not belong to your account',
        HttpStatus.FORBIDDEN
      );
    }

    // Calculate cancellation fee and check if cancellation is allowed
    const cancellationResult = calculateCancellationFee(
      typedReservation.total_price,
      typedReservation.reservation_date,
      typedReservation.status ?? 'pending'
    );

    if (!cancellationResult.canCancel) {
      return errorResponse(
        cancellationResult.reason ?? 'This reservation cannot be cancelled',
        HttpStatus.BAD_REQUEST
      );
    }

    // Update reservation status to cancelled
    const { data: updatedReservation, error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'customer',
        cancellation_reason: reason ?? 'Customer self-service cancellation',
        cancellation_fee: cancellationResult.cancellationFee,
      })
      .eq('id', reservationId)
      .select()
      .single();

    if (updateError || !updatedReservation) {
      console.error('Error updating reservation:', updateError);
      return errorResponse(
        'Failed to cancel reservation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Update slot availability (return pax to available)
    if (typedReservation.slot_id) {
      const { data: slot } = await supabase
        .from('slots')
        .select('current_pax')
        .eq('id', typedReservation.slot_id)
        .single();

      if (slot) {
        const newCurrentPax = Math.max(0, slot.current_pax - typedReservation.pax);
        await supabase
          .from('slots')
          .update({ current_pax: newCurrentPax })
          .eq('id', typedReservation.slot_id);
      }
    }

    // TODO: Initiate refund if payment was made
    // This would integrate with Stripe refund API

    // TODO: Send cancellation confirmation email

    return successResponse({
      message: 'Reservation cancelled successfully',
      reservationId: updatedReservation.id,
      bookingNumber: updatedReservation.booking_number,
      cancellation: {
        cancellationFee: cancellationResult.cancellationFee,
        refundAmount: cancellationResult.refundAmount,
        feePercentage: cancellationResult.feePercentage,
        daysUntil: cancellationResult.daysUntil,
      },
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    return errorResponse(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
