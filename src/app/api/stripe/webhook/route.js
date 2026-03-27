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

      let expiresAt = null;
      let downloadsUsed = undefined;

      if (planId === 'single_download') {
        downloadsUsed = 0; // Reset downloads
      } else if (planId === 'monthly_subscription') {
        const d = new Date(); d.setMonth(d.getMonth() + 1);
        expiresAt = d.toISOString();
      } else if (planId === 'quarterly_subscription') {
        const d = new Date(); d.setMonth(d.getMonth() + 3);
        expiresAt = d.toISOString();
      } else if (planId === 'annual_subscription') {
        const d = new Date(); d.setFullYear(d.getFullYear() + 1);
        expiresAt = d.toISOString();
      }

      const updatePayload = {
        id: userId,
        subscription_tier: planId,
        updated_at: new Date().toISOString()
      };
      
      if (expiresAt) updatePayload.plan_expires_at = expiresAt;
      if (downloadsUsed !== undefined) updatePayload.downloads_used = downloadsUsed;

      await supabase.from('profiles').upsert(updatePayload, { onConflict: 'id' });
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
