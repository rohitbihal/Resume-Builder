import Stripe from 'stripe';

// This will be pulled from .env.local
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16', // Ensure this matches your typed definitions
  appInfo: {
    name: 'CreativeResume',
    version: '0.1.0',
  },
});
