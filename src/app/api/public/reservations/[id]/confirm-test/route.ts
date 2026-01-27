import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/public/reservations/[id]/confirm-test
 * Test mode only: Confirm a reservation without actual payment
 * Works when SKIP_STRIPE_PAYMENT=true OR when Stripe is not configured
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check if test mode is enabled (explicit flag OR Stripe not configured)
  const skipStripePaymentEnv = process.env.SKIP_STRIPE_PAYMENT === 'true';
  const stripeConfigured = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  const testModeEnabled = skipStripePaymentEnv || !stripeConfigured;

  if (!testModeEnabled) {
    return NextResponse.json(
      { success: false, error: 'テストモードが無効です' },
      { status: 403 }
    );
  }

  const { id: reservationId } = await params;

  if (!reservationId) {
    return NextResponse.json(
      { success: false, error: '予約IDが必要です' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Step 1: Update reservation status to confirmed (test mode)
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('Failed to update test reservation:', updateError);
      return NextResponse.json(
        { success: false, error: '予約の更新に失敗しました', details: updateError.message },
        { status: 500 }
      );
    }

    // Step 2: Fetch updated reservation with relations
    const { data, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        id,
        booking_number,
        reservation_date,
        reservation_time,
        pax,
        total_price,
        customer:customers!customer_id (
          id,
          email,
          name,
          mypage_token
        ),
        course:courses!course_id (
          id,
          title,
          heliport:heliports!heliport_id (
            id,
            name,
            address
          )
        )
      `)
      .eq('id', reservationId)
      .single();

    if (fetchError || !data) {
      console.error('Failed to fetch test reservation:', fetchError);
      return NextResponse.json(
        { success: false, error: '予約データの取得に失敗しました', details: fetchError?.message },
        { status: 500 }
      );
    }

    console.log(`[TEST MODE] Reservation ${reservationId} confirmed without payment`);

    // Type assertions for nested objects (Supabase returns these as unknown)
    const customer = data.customer as unknown as {
      id: string;
      email: string;
      name: string;
      mypage_token?: string;
    } | null;

    const course = data.course as unknown as {
      id: string;
      title: string;
      heliport?: {
        id: string;
        name: string;
        address?: string;
      } | null;
    } | null;

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        bookingNumber: data.booking_number,
        reservationDate: data.reservation_date,
        reservationTime: data.reservation_time,
        pax: data.pax,
        totalPrice: data.total_price,
        customerName: customer?.name,
        customerEmail: customer?.email,
        courseName: course?.title,
        heliportName: course?.heliport?.name,
        heliportAddress: course?.heliport?.address,
        mypageToken: customer?.mypage_token,
        testMode: true,
      },
    });
  } catch (error) {
    console.error('Error confirming test reservation:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
