import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { logger, getRequestId, logRequest } from '@/lib/logger';
import { errorResponse } from '@/lib/validate';
import { Resend } from 'resend';
import ReceiptEmail from '@/emails/ReceiptEmail';

// Initialize core services safely
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const log = logger('api/stripe/webhook');
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const requestId = getRequestId(req);
  const startTime = Date.now();
  logRequest(log, req, { requestId, method: 'POST' });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    log.error('Missing Stripe signature', { requestId });
    return NextResponse.json(errorResponse('Missing stripe-signature header', requestId), { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    log.error('Webhook signature verification failed', { requestId, error: error.message });
    return NextResponse.json(errorResponse(`Webhook Error: ${error.message}`, requestId), { status: 400 });
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
      log.info('Subscription plan updated', { requestId, userId, planId, eventType: event.type });

      // Dispatch Transactional Email Receipt
      const userEmail = session.customer_details?.email;
      const userName = session.customer_details?.name || 'Customer';
      
      if (resend && userEmail) {
        try {
          await resend.emails.send({
            from: 'CreativeResume <receipts@creativeresume.com>', // Use verified domain in prod
            to: userEmail,
            subject: 'Your CreativeResume Receipt',
            react: ReceiptEmail({ 
              customerName: userName, 
              amount: (session.amount_total / 100).toFixed(2), 
              plan: planId 
            }),
          });
          log.info('Receipt email dispatched', { requestId, to: userEmail });
        } catch (emailErr) {
          log.warn('Failed to send receipt email', { requestId, error: emailErr.message });
        }
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
      log.info('Subscription deleted', { requestId, subscriptionId: subscription.id });
      break;
    }
    default:
      log.warn(`Unhandled event type`, { requestId, type: event.type });
  }

  log.info('Webhook processed successfully', { requestId, durationMs: Date.now() - startTime });
  return NextResponse.json({ success: true, received: true });
}
