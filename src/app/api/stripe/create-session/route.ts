import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { successResponse, errorResponse, HttpStatus } from '@/lib/api/response';

type CreateSessionRequest = {
  reservationId: string;
  amount: number;
  courseName: string;
  customerEmail: string;
};

/**
 * POST /api/stripe/create-session
 * Create a Stripe Checkout session for a reservation
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSessionRequest;

    // Validate required fields
    const { reservationId, amount, courseName, customerEmail } = body;

    if (!reservationId) {
      return errorResponse('Missing required field: reservationId', HttpStatus.BAD_REQUEST);
    }
    if (!amount || amount <= 0) {
      return errorResponse('Invalid amount', HttpStatus.BAD_REQUEST);
    }
    if (!courseName) {
      return errorResponse('Missing required field: courseName', HttpStatus.BAD_REQUEST);
    }
    if (!customerEmail) {
      return errorResponse('Missing required field: customerEmail', HttpStatus.BAD_REQUEST);
    }

    // Get base URL for redirects
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: courseName,
              description: `Reservation ID: ${reservationId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId,
      },
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/error`,
    });

    return successResponse({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', HttpStatus.BAD_REQUEST);
    }

    console.error('Error creating Stripe checkout session:', error);
    return errorResponse('Failed to create checkout session', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
