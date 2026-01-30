import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';
import { sendReservationConfirmation, sendAdminNewBookingNotification } from '@/lib/email/client';
import type Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle checkout.session.completed event
 * Update reservation status to confirmed and send confirmation email
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservationId;

  if (!reservationId) {
    console.error('No reservationId in session metadata:', session.id);
    return;
  }

  try {
    const supabase = await createClient();

    // Update reservation status
    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('Failed to update reservation:', updateError);
      throw updateError;
    }


    // Fetch reservation details for email
    const { data: reservation, error: fetchError } = await supabase
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

    if (fetchError || !reservation) {
      console.error('Failed to fetch reservation for email:', fetchError);
      // Don't throw - reservation is already confirmed, email is secondary
      return;
    }

    // Extract nested objects (Supabase may return arrays for joined tables)
    const customerRaw = reservation.customer;
    const customer = Array.isArray(customerRaw) ? customerRaw[0] as { id: string; email: string; name: string; mypage_token?: string } | undefined : customerRaw as { id: string; email: string; name: string; mypage_token?: string } | null;
    const courseRaw = reservation.course;
    const courseObj = Array.isArray(courseRaw) ? courseRaw[0] as { id: string; title: string; heliport?: { id: string; name: string; address?: string }[] | { id: string; name: string; address?: string } | null } | undefined : courseRaw as { id: string; title: string; heliport?: { id: string; name: string; address?: string }[] | { id: string; name: string; address?: string } | null } | null;
    const heliportRaw = courseObj?.heliport;
    const heliport = Array.isArray(heliportRaw) ? heliportRaw[0] : heliportRaw;
    const course = courseObj ? { ...courseObj, heliport: heliport ?? null } : null;

    if (!customer || !course) {
      console.error('Missing customer or course data for email');
      return;
    }

    // Build mypage URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const mypageUrl = customer.mypage_token
      ? `${baseUrl}/mypage?token=${customer.mypage_token}`
      : `${baseUrl}/mypage`;

    // Send confirmation email
    const emailResult = await sendReservationConfirmation({
      to: customer.email,
      customerName: customer.name,
      courseName: course.title,
      flightDate: reservation.reservation_date || '',
      flightTime: reservation.reservation_time || '',
      pax: reservation.pax,
      totalPrice: reservation.total_price || 0,
      bookingNumber: reservation.booking_number,
      heliportName: course.heliport?.name || '',
      heliportAddress: course.heliport?.address || '',
      mypageUrl,
    });

    if (!emailResult.success) {
      console.error(`Failed to send confirmation email for reservation ${reservationId}:`, emailResult.error);
      // Don't throw - reservation is already confirmed, email failure is logged but not critical
    }

    // Send admin new booking notification (fire-and-forget)
    try {
      sendAdminNewBookingNotification({
        to: 'info@privatesky.co.jp',
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: '',
        courseName: course.title,
        flightDate: reservation.reservation_date || '',
        flightTime: reservation.reservation_time || '',
        pax: reservation.pax,
        totalPrice: reservation.total_price || 0,
        bookingNumber: reservation.booking_number,
      }).catch((emailError) => {
        console.error('[Email] Failed to send admin new booking notification:', emailError);
      });
    } catch (emailError) {
      console.error('[Email] Failed to send admin new booking notification:', emailError);
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}
