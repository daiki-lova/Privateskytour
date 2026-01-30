import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, AuthenticationError, AuthorizationError } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  HttpStatus,
} from '@/lib/api/response';

/**
 * GET /api/admin/refunds
 * Get list of refunds or refund candidates (cancelled/suspended reservations with paid payments)
 * Query params:
 *   - status: 'pending' (未返金候補), 'completed' (返金済み), 'all'
 *   - page: Page number (default: 1)
 *   - pageSize: Items per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await requireRole(supabase, ['admin', 'staff', 'viewer']);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'pending';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const offset = (page - 1) * pageSize;

    if (status === 'pending') {
      // Get refund candidates: cancelled/suspended reservations with paid payments but no refund
      const { data: reservations, error: reservationsError, count } = await supabase
        .from('reservations')
        .select(`
          id,
          booking_number,
          status,
          reservation_date,
          reservation_time,
          pax,
          total_price,
          cancelled_at,
          cancellation_reason,
          customer_id,
          customers (
            id,
            name,
            email,
            phone
          ),
          courses (
            id,
            title
          ),
          payments!inner (
            id,
            amount,
            status,
            stripe_payment_intent_id,
            paid_at
          )
        `, { count: 'exact' })
        .in('status', ['cancelled'])
        .eq('payments.status', 'paid')
        .order('cancelled_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (reservationsError) {
        console.error('Error fetching refund candidates:', reservationsError);
        return errorResponse('Failed to fetch refund candidates', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Filter out reservations that already have completed refunds
      const reservationIds = reservations?.map(r => r.id) ?? [];

      let refundedReservationIds: string[] = [];
      if (reservationIds.length > 0) {
        const { data: existingRefunds, error: refundsError } = await supabase
          .from('refunds')
          .select('reservation_id, amount')
          .in('reservation_id', reservationIds)
          .eq('status', 'completed');

        if (refundsError) {
          console.error('Error fetching existing refunds:', refundsError);
        } else {
          // Get fully refunded reservation IDs
          const refundAmountsByReservation = new Map<string, number>();
          existingRefunds?.forEach(r => {
            const current = refundAmountsByReservation.get(r.reservation_id) ?? 0;
            refundAmountsByReservation.set(r.reservation_id, current + r.amount);
          });

          refundedReservationIds = reservations
            ?.filter(res => {
              const paymentArray = res.payments;
              if (!Array.isArray(paymentArray) || paymentArray.length === 0) return false;
              const payment = paymentArray[0];
              const refundedAmount = refundAmountsByReservation.get(res.id) ?? 0;
              return refundedAmount >= payment.amount;
            })
            .map(r => r.id) ?? [];
        }
      }

      // Transform response
      const refundCandidates = reservations
        ?.filter(r => !refundedReservationIds.includes(r.id))
        .map(res => {
          const paymentArray = res.payments;
          const payment = Array.isArray(paymentArray) && paymentArray.length > 0 ? paymentArray[0] : null;
          const customerRaw = res.customers;
          const customer = Array.isArray(customerRaw) ? customerRaw[0] ?? null : customerRaw;
          const courseRaw = res.courses;
          const course = Array.isArray(courseRaw) ? courseRaw[0] ?? null : courseRaw;

          return {
            id: res.id,
            bookingNumber: res.booking_number,
            status: res.status,
            reservationDate: res.reservation_date,
            reservationTime: res.reservation_time,
            pax: res.pax,
            totalPrice: res.total_price,
            cancelledAt: res.cancelled_at,
            cancellationReason: res.cancellation_reason,
            customer: customer ? {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
            } : null,
            course: course ? {
              id: course.id,
              title: course.title,
            } : null,
            payment: payment ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              stripePaymentIntentId: payment.stripe_payment_intent_id,
              paidAt: payment.paid_at,
            } : null,
          };
        }) ?? [];

      const total = count ?? 0;
      return paginatedResponse(refundCandidates, total, page, pageSize);
    }

    if (status === 'completed' || status === 'all') {
      // Get completed refunds from refunds table
      let query = supabase
        .from('refunds')
        .select(`
          id,
          reservation_id,
          payment_id,
          amount,
          reason,
          reason_detail,
          stripe_refund_id,
          status,
          processed_at,
          processed_by,
          reservations (
            id,
            booking_number,
            reservation_date,
            reservation_time,
            total_price,
            customers (
              id,
              name,
              email
            ),
            courses (
              id,
              title
            )
          ),
          admin_users:processed_by (
            id,
            name,
            email
          )
        `, { count: 'exact' })
        .order('processed_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (status === 'completed') {
        query = query.eq('status', 'completed');
      }

      const { data: refunds, error: refundsError, count } = await query;

      if (refundsError) {
        console.error('Error fetching refunds:', refundsError);
        return errorResponse('Failed to fetch refunds', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const transformedRefunds = refunds?.map(refund => {
        // reservations is a single object due to FK relationship
        const reservationRaw = refund.reservations;
        const reservation = Array.isArray(reservationRaw) ? reservationRaw[0] ?? null : reservationRaw;
        // admin_users is a single object due to FK relationship
        const adminUserRaw = refund.admin_users;
        const adminUserData = Array.isArray(adminUserRaw) ? adminUserRaw[0] ?? null : adminUserRaw;

        return {
          id: refund.id,
          reservationId: refund.reservation_id,
          paymentId: refund.payment_id,
          amount: refund.amount,
          reason: refund.reason,
          reasonDetail: refund.reason_detail,
          stripeRefundId: refund.stripe_refund_id,
          status: refund.status,
          processedAt: refund.processed_at,
          processedBy: adminUserData ? {
            id: adminUserData.id,
            name: adminUserData.name,
            email: adminUserData.email,
          } : null,
          reservation: reservation ? {
            id: reservation.id,
            bookingNumber: reservation.booking_number,
            reservationDate: reservation.reservation_date,
            reservationTime: reservation.reservation_time,
            totalPrice: reservation.total_price,
            customer: (() => {
              const c = reservation.customers;
              const customerObj = Array.isArray(c) ? c[0] ?? null : c;
              return customerObj ? {
                id: customerObj.id,
                name: customerObj.name,
                email: customerObj.email,
              } : null;
            })(),
            course: (() => {
              const co = reservation.courses;
              const courseObj = Array.isArray(co) ? co[0] ?? null : co;
              return courseObj ? {
                id: courseObj.id,
                title: courseObj.title,
              } : null;
            })(),
          } : null,
        };
      }) ?? [];

      const total = count ?? 0;
      return paginatedResponse(transformedRefunds, total, page, pageSize);
    }

    return errorResponse('Invalid status parameter. Use: pending, completed, or all', HttpStatus.BAD_REQUEST);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return errorResponse(error.message, HttpStatus.UNAUTHORIZED);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error.message, HttpStatus.FORBIDDEN);
    }

    console.error('Unexpected error in GET /api/admin/refunds:', error);
    return errorResponse('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
