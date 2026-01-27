import { NextResponse } from 'next/server';

/**
 * GET /api/public/payment-mode
 * Check if payment test mode is enabled
 * Test mode is enabled when:
 * 1. SKIP_STRIPE_PAYMENT=true, OR
 * 2. Stripe is not configured (no STRIPE_SECRET_KEY)
 */
export async function GET() {
  const skipStripePaymentEnv = process.env.SKIP_STRIPE_PAYMENT === 'true';
  const stripeConfigured = !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  // Test mode if explicitly set OR if Stripe is not configured
  const testMode = skipStripePaymentEnv || !stripeConfigured;

  return NextResponse.json({
    testMode,
    stripeConfigured,
    message: testMode
      ? 'テストモードが有効です。決済はスキップされます。'
      : 'Stripe決済が有効です。',
  });
}
