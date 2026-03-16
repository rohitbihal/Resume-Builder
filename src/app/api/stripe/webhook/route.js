import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Note: Needs a Service Role key to bypass RLS in a webhook context
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, planId, resumeId } = session.metadata;

      if (!userId || userId === 'guest_id') break;

      if (session.mode === 'subscription') {
        // Save Subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan: planId,
          status: 'active',
        }, { onConflict: 'user_id' });
      } else if (session.mode === 'payment' && planId === 'single_download') {
        // Save Purchase
        await supabase.from('purchases').insert({
          user_id: userId,
          resume_id: resumeId,
          stripe_payment_intent_id: session.payment_intent,
          amount_cents: session.amount_total,
          status: 'succeeded'
        });
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      // Logic for recurring payments
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse('Webhook Received', { status: 200 });
}
