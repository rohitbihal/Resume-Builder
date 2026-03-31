import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is missing. Stripe integration will not function.');
}

// Fallback to a clear, invalid string for development to avoid crash during dev init if env not set yet,
// but ensure it's logged or handled.
const finalKey = stripeSecretKey || 'sk_test_missing_in_development';

export const stripe = new Stripe(finalKey, {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'CreativeResume',
    version: '0.1.0',
  },
});
