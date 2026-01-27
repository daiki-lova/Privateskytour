import { NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';
import { stripe } from '@/lib/stripe/client';
import type { Database } from '@/lib/supabase/database.types';

type RefundReason = Database['public']['Enums']['refund_reason'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface RefundRequestBody {
  amount?: number;
  reason?: RefundReason;
  reasonDetail?: string;
}

/**
 * POST /api/admin/reservations/[id]/refund
 * Process refund for a reservation via Stripe
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const adminUser = await requireRole(supabase, ['admin', 'staff']);

    const { id: reservationId } = await context.params;

    if (!reservationId) {
      return errorResponse('Reservation ID is required', HttpStatus.BAD_REQUEST);
    }

    const body: RefundRequestBody = await request.json();
    const { amount, reason = 'customer_request', reasonDetail } = body;

    // 1. Fetch reservation with payment information
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        id,
        booking_number,
        status,
        total_price,
        customer_id,
        customers (
          id,
          name,
          email
        )
      `)
      .eq('id', reservationId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('Reservation not found', HttpStatus.NOT_FOUND);
      }
      console.error('Error fetching reservation:', fetchError);
      return errorResponse('Failed to fetch reservation', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. Fetch payment information for this reservation
    const { data: payment, error: paymentFetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('reservation_id', reservationId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentFetchError) {
      if (paymentFetchError.code === 'PGRST116') {
        return errorResponse('No paid payment found for this reservation', HttpStatus.BAD_REQUEST);
      }
      console.error('Error fetching payment:', paymentFetchError);
      return errorResponse('Failed to fetch payment information', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!payment.stripe_payment_intent_id) {
      return errorResponse('No Stripe payment intent ID found', HttpStatus.BAD_REQUEST);
    }

    // 3. Check if refund already exists for this payment
    const { data: existingRefund, error: existingRefundError } = await supabase
      .from('refunds')
      .select('id, amount, status')
      .eq('payment_id', payment.id)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingRefundError) {
      console.error('Error checking existing refund:', existingRefundError);
    }

    // Calculate maximum refundable amount
    const alreadyRefundedAmount = existingRefund?.amount ?? 0;
    const maxRefundableAmount = payment.amount - alreadyRefundedAmount;

    if (maxRefundableAmount <= 0) {
      return errorResponse('This payment has already been fully refunded', HttpStatus.BAD_REQUEST);
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount ?? maxRefundableAmount;

    if (refundAmount <= 0) {
      return errorResponse('Refund amount must be greater than 0', HttpStatus.BAD_REQUEST);
    }

    if (refundAmount > maxRefundableAmount) {
      return errorResponse(
        `Refund amount exceeds maximum refundable amount (${maxRefundableAmount} yen)`,
        HttpStatus.BAD_REQUEST
      );
    }

    // 4. Process refund via Stripe
    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          reservation_id: reservationId,
          booking_number: reservation.booking_number,
          processed_by: adminUser.email,
          reason: reason,
          reason_detail: reasonDetail ?? '',
        },
      });
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Stripe refund failed';
      return errorResponse(`Stripe refund failed: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 5. Record refund in database
    const { data: refundRecord, error: insertError } = await supabase
      .from('refunds')
      .insert({
        reservation_id: reservationId,
        payment_id: payment.id,
        amount: refundAmount,
        reason: reason,
        reason_detail: reasonDetail ?? null,
        stripe_refund_id: stripeRefund.id,
        status: 'completed',
        processed_at: new Date().toISOString(),
        processed_by: adminUser.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error recording refund:', insertError);
      // Note: Stripe refund was successful, but database record failed
      // This should be handled by manual reconciliation
      return errorResponse(
        'Refund processed in Stripe but failed to record in database. Please contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // 6. Update payment status
    const isFullRefund = refundAmount === payment.amount;
    const totalRefunded = alreadyRefundedAmount + refundAmount;
    const isFullyRefunded = totalRefunded >= payment.amount;

    const newPaymentStatus: PaymentStatus = isFullyRefunded ? 'refunded' : 'partial_refund';

    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('Error updating payment status:', paymentUpdateError);
      // Non-critical error, continue
    }

    // 7. Log the refund operation
    try {
      await supabase.rpc('create_audit_log', {
        p_action: 'Refund Processed',
        p_log_type: 'stripe',
        p_status: 'success',
        p_message: `Refund of ${refundAmount} yen processed for ${reservation.booking_number}`,
        p_target_table: 'refunds',
        p_target_id: refundRecord.id,
        p_new_values: {
          refund_id: refundRecord.id,
          stripe_refund_id: stripeRefund.id,
          amount: refundAmount,
          reason: reason,
        },
      });
    } catch (logError) {
      console.error('Error creating audit log:', logError);
      // Non-critical error, continue
    }

    console.log(
      `Refund processed: ${reservation.booking_number} - ${refundAmount} yen by ${adminUser.email}. Reason: ${reason}`
    );

    return successResponse({
      refund: {
        id: refundRecord.id,
        reservationId: refundRecord.reservation_id,
        paymentId: refundRecord.payment_id,
        amount: refundRecord.amount,
        reason: refundRecord.reason,
        reasonDetail: refundRecord.reason_detail,
        stripeRefundId: refundRecord.stripe_refund_id,
        status: refundRecord.status,
        processedAt: refundRecord.processed_at,
        processedBy: adminUser.email,
      },
      stripeRefund: {
        id: stripeRefund.id,
        status: stripeRefund.status,
        amount: stripeRefund.amount,
      },
      paymentStatus: newPaymentStatus,
      isFullRefund: isFullyRefunded,
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

    console.error('Unexpected error in POST /api/admin/reservations/[id]/refund:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
