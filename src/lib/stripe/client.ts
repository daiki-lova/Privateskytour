import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return key;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!stripeInstance) {
      stripeInstance = new Stripe(getStripeSecretKey(), {
        apiVersion: '2025-12-15.clover',
      });
    }
    return stripeInstance[prop as keyof Stripe];
  },
});
